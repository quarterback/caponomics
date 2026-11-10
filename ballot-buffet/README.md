# Ballot Buffet

A ranked-choice counting lab, forked from Cap Buffet. Build a single-transferable-vote count from
interchangeable rules, load any set of ballots, and see who wins. Portland's 2024 count is one of
twelve presets.

Live at **https://ballot.capbuffet.com/** (Vercel project with root directory `ballot-buffet/`).

> A calculator, not a prescription. It reports what a counting rule does to a set of ballots.

## Run it

```bash
npm install
npm run dev        # dev server (Vite)
npm run build      # static build → dist/
npm test           # engine unit tests (Vitest)
```

Fully client-side (React + TypeScript + Vite), same toolchain and theme as Cap Buffet. This folder is
self-contained, so it can be lifted into its own repository or deployed by pointing Vercel/Netlify's
root directory at `ballot-buffet/`.

## What you can change

| Rule slot | Options |
| --- | --- |
| Machine | round-by-round STV · Meek / Warren keep values · consent committee (MCPC) · first choices only |
| Threshold | Droop · exact Droop · Hare · any custom share |
| Surplus transfers | all ballots (WIGM) · last parcel · none; all at once or largest first; 4-decimal or exact arithmetic |
| Elimination | fewest votes · bottom-two runoff (BTR) · lowest Borda (STV-B) |
| Transfer value | rank decay: share of a ballot kept when it moves after an elimination |
| Completion | elect whoever remains · send open seats to a fresh full-value count |
| Held-out seats | 0…all seats filled by a districtwide Condorcet or instant-runoff count (2+1 hybrid, sequential RCV) |
| MCPC | consent depth (top-N) and the mandate μ every winner must hold |

Seats are set on the contest, so any rule can be run as a 3-seat district or a single-member one.

## Presets

Portland 2024 · Meek · Warren · Last-parcel Gregory · BTR-WIGM · STV-B · Hare-Mandate STV ·
2+1 Hybrid · Rank-decay transfers · MCPC · Sequential Mandate RCV · First-choice plurality.

## Score ballots and Transferable Range Voting

Transferable Range Voting (TRV) is from Thomas Bewley and Paolo Luchini, "A new method for
approximating proportional representation in multi-seat elections based on range or approval
voting" (working paper, January 2025; reference code at github.com/tbewley/TRV). Voters score
candidates. Each ballot holds one unit of currency, a seat costs a third of all currency, and the
winner's backers pay in proportion to what they offered. There are no eliminations.

- **Currency per ballot** is the paper's C. At 1 the count is proportional; at the number of seats
  it is plain score voting. Values in between trade one for the other.
- **Rescale each ballot** follows the paper's default: each voter's top score counts as 1 and lowest
  as 0. Turn it off to count scores as marked.
- **Score ballots** come from the generator, which keeps each voter's score for every candidate
  alongside the ranking, or from text lines like `3: A=5, B=2`. Ranked-only ballots, including the
  real districts, are converted by a setting: points by rank, or approval of the top choices. The
  result says when a conversion was used.

The tests reproduce the five worked examples in section 2.1 of the paper.

## Ballot sets

### Real ballots: Portland, November 2024
All four council districts, converted from Multnomah County's published cast vote records. Each
district loads when you choose it. The Portland preset elects the certified winners in all four.

| District | Valid ballots | Candidates | Distinct rankings |
| --- | --- | --- | --- |
| 1 | 42,972 | 16 and write-ins | 18,970 |
| 2 | 77,209 | 22 and write-ins | 41,191 |
| 3 | 84,569 | 30 and write-ins | 40,736 |
| 4 | 76,776 | 30 and write-ins | 38,281 |

To add another contest, download its cast vote record from the county and run:

```bash
python3 scripts/convert_cvr.py <cvr.csv> public/data/<name>.json "<display name>"
```

Then add an entry to `REAL_SETS` in `src/engine/real.ts`. The script header explains how ballots
with skipped ranks, overvotes and repeated candidates are read.

### Test sets

- **Free radicals / Disciplined slates** — a seeded synthetic district (3,000 voters, 18 candidates,
  three camps) at low and high slate cohesion. Cohesion, field size, bullet-voting rate, ranking limit
  and camp sizes are all sliders.
- **Seven small candidates, one backup** — the 100-voter case where rank decay flips a 26–22 majority.
- **60 / 40 blocs** — proportional 2–1 versus a majoritarian sweep.
- **Majority that won't rank** — 56% wins one seat of three.
- **Center squeeze** — one seat; the head-to-head winner has the fewest first choices.

Candidates get a random first name and surname from `src/engine/names.ts`, a pool of about 1,950
surnames and 900 first names taken from the viperball repo's name pools. Any match with a real
person is a coincidence. The same seed gives the same names, and moving a slider keeps them. A
coloured square beside a name shows the candidate's camp.

Or paste your own: one line per group, `26: A > B > C`.

## Readouts

- Winners, and how each was seated.
- Least-supported winner: the share of voters who ranked that winner in their top three.
- Voters who ranked a winner, and voters whose first choice won.
- Votes that ran out: vote value that ended with no candidate.
- Winners seated below the threshold.
- Losers preferred to a winner in a head-to-head comparison.
- Seats against first-choice share, by camp.
- The round-by-round table, and every preset run on the same ballots.

## Charter or code

Each rule is tagged by where it lives in Portland law, and each system gets a reading: current law,
changeable by ordinance, or needs a charter amendment. Charter §3-102 fixes STV, a threshold tied to
the number of seats, surplus transfers to next-ranked candidates and elimination of the lowest-polling
candidates; City Code 2.08.030 holds the arithmetic. This is a plain reading of the text, not legal
advice.

## Known limits

- The generated district is synthetic. The real sets are a re-tally: voters ranked as they did
  under the current rules, and would not necessarily rank the same way under different ones.
- The real counts match the certified winners. They have not been checked round by round against
  the county's certified report, and 14,311 rows in each county file carry a status flag of -1
  whose meaning is not confirmed. Those rows are included.
- Ties are broken deterministically (fewest first choices, then ballot order); Portland draws lots.
- Meek/Warren use floating-point iteration to a tolerance, not a certified reference implementation.
- BTR and Borda elimination use the ballots still in play at their current value.
- MCPC enumerates every committee up to 60,000 combinations, then falls back to a greedy build.
- CPO-STV, Schulze STV, Wright and whole-ballot sampling methods are not implemented.

## Layout

- `src/engine/count.ts` — the counting engine (`runCount(profile, system, seats)`).
- `src/engine/systems.ts` — presets and the charter-fit reading.
- `src/engine/profiles.ts` — ballot sets, generator, text format.
- `src/engine/metrics.ts` — the yardsticks.
- `src/ui/` — React shell; `base.css` is Cap Buffet's stylesheet, `app.css` the additions.
