# After-Action Report — Real ballots: Portland's 2024 council districts

**Date completed:** 2026-11-10
**Branch:** `claude/peaceful-faraday-35fzk2` (in `quarterback/caponomics`, folder `ballot-buffet/`)

Continues `aar-ballot-buffet-build.md`.

---

## What was asked for

Another agent criticised the tool for using only synthetic ballots. Ron asked what real ballots
would change, then asked the agent to look at what the county publishes and say what to import.

---

## What shipped

**What the county publishes.** One CSV per ranked-choice contest, 100 to 160 MB, with a row for
every ballot in the county (332,969) and a 0/1 column for each candidate at each of six ranks.

**What was imported.** All four council districts. `scripts/convert_cvr.py` reads each ballot the
way City Code 2.08.030(A) says (skip an empty rank, skip an overvoted rank, count a repeated
candidate once), merges the write-in columns, groups identical rankings, and writes a compact
file to `public/data/`. The four files total 2.8 MB and load only when a district is chosen.

**What the real ballots show under the Portland count.**

| District | Valid ballots | Threshold | Rounds | Votes that ran out | Certified winners reproduced |
| --- | --- | --- | --- | --- | --- |
| 1 | 42,972 | 10,744 | 17 | 26.5% | Yes. Dunphy is seated below the threshold. |
| 2 | 77,209 | 19,303 | 22 | 19.6% | Yes |
| 3 | 84,569 | 21,143 | 29 | 10.5% | Yes |
| 4 | 76,776 | 19,195 | 31 | 23.6% | Yes |

**Where the other systems differ.**
- District 1: bottom-two runoff, STV-B, Hare-Mandate, 2+1, MCPC and sequential RCV seat Routh in
  place of Dunphy.
- District 2: only MCPC differs, seating DePass in place of Kanal.
- District 3: every system elects the same three.
- District 4: Hare-Mandate, MCPC, sequential RCV and first-choice plurality seat Arnold in place
  of Green.

---

## What the real data caught

- *The run-out figure was wrong.* When the last winners crossed the threshold together, the count
  moved their extra votes on with no one left to receive them, and the readout counted those as
  run out. Districts 2 and 4 both read exactly 25%. The count now stops when the last seat is
  filled. A test pins this.
- *Write-ins change the round count.* With four separate write-in columns the count ran 20 rounds
  in District 1. Merged into one candidate it runs 17, and Districts 2 and 3 run 22 and 29, which
  are the round numbers reported for the certified count.
- *Speed.* One count of a district takes 0.2 to 0.9 seconds. The All Systems table runs twelve, so
  for real sets it waits for a click.

- *A test that only passed from one folder.* The real-ballot test read its data relative to the
  folder it was run from, so it failed from the repo root. The first fix used a file URL, which
  fails in the browser-like test environment, and that broken version was pushed before the
  agent noticed. The second fix joins the path from the test file's own folder; both test runs
  pass.

---

## Not verified

- The thresholds and tallies have not been compared with the county's certified round-by-round
  report. The report could not be downloaded from the build session. The winners match, and the
  round counts match the published ones for Districts 2 and 3.
- 14,311 rows in every county file have a status of -1. They are included. What the flag means
  was not established.
- A re-tally under another rule is not a forecast. Voters and campaigns would behave differently
  under different rules.
