#!/usr/bin/env python3
"""Convert a Multnomah County cast vote record (CSV) into Ballot Buffet's
compact ballot file.

    python3 scripts/convert_cvr.py <cvr.csv> <out.json> "<display name>"

The county publishes one CSV per ranked-choice contest, with a row for every
ballot in the county and a 0/1 column for each candidate at each rank:

    Choice_<id>_1:<contest>:<rank>:Number of Winners <n>:<candidate>:NON

Ballots are read the way Portland City Code 2.08.030(A) says:
  - a rank with no mark is skipped;
  - a rank with more than one candidate marked (an overvote) is skipped;
  - a candidate ranked more than once counts at the highest rank only;
  - a ballot with no usable ranking is left out.
All write-in columns are merged into one candidate, "Write-in".

Identical rankings are grouped, so the output is a list of [count, ranking]
pairs, with candidates stored as indexes to keep the file small.
"""
import collections, csv, json, re, sys

src, out, name = sys.argv[1], sys.argv[2], sys.argv[3]
WRITE_IN = 'Write-in'

with open(src, newline='', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    head = next(reader)
    cols = []  # (column index, candidate, rank)
    seats = 1
    for i, h in enumerate(head):
        if not h.startswith('Choice_'):
            continue
        parts = h.split(':')
        cand = WRITE_IN if re.search(r'(?i)write.?in', parts[4]) else parts[4]
        cols.append((i, cand, int(parts[2])))
        m = re.search(r'Number of Winners (\d+)', parts[3])
        if m:
            seats = int(m.group(1))
    candidates = []
    for _, c, _ in cols:
        if c not in candidates:
            candidates.append(c)
    max_rank = max(k for _, _, k in cols)

    groups = collections.Counter()
    stats = collections.Counter()
    for row in reader:
        stats['rows'] += 1
        by_rank = [set() for _ in range(max_rank + 1)]
        for i, c, k in cols:
            if row[i] == '1':
                by_rank[k].add(c)
        if not any(by_rank):
            continue
        stats['marked'] += 1
        ranking = []
        flags = set()
        for k in range(1, max_rank + 1):
            marks = by_rank[k]
            if not marks:
                if any(by_rank[k + 1:]):
                    flags.add('skipped_rank')
                continue
            if len(marks) > 1:
                flags.add('overvote')
                continue
            c = next(iter(marks))
            if c in ranking:
                flags.add('repeated_candidate')
                continue
            ranking.append(c)
        for fl in flags:
            stats[fl] += 1
        if not ranking:
            stats['no_usable_ranking'] += 1
            continue
        stats['valid'] += 1
        groups[tuple(candidates.index(c) for c in ranking)] += 1

# Drop candidates nobody ranked (e.g. an unused write-in line) and re-index.
used = sorted({i for g in groups for i in g})
remap = {old: new for new, old in enumerate(used)}
data = {
    'name': name,
    'seats': seats,
    'source': 'Multnomah County Elections cast vote record, November 5, 2024 general election',
    'stats': dict(stats),
    'candidates': [candidates[i] for i in used],
    'ballots': [[n, [remap[i] for i in g]] for g, n in groups.most_common()],
}
json.dump(data, open(out, 'w'), separators=(',', ':'), ensure_ascii=False)
print(name, dict(stats), 'candidates', len(data['candidates']), 'distinct rankings', len(groups))
