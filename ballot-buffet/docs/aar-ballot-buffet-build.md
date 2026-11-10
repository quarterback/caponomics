# After-Action Report — Ballot Buffet: an STV counting lab forked from Cap Buffet

**Date completed:** 2026-11-10
**Branch:** `claude/peaceful-faraday-35fzk2` (in `quarterback/caponomics`, folder `ballot-buffet/`)

---

## What was asked for

*"i want to fork a version of cap buffet that looks at ranked choice voting single transferable
vote the version that Portland has… a cap buffet style tool to just look at STV RCV and play around
with the various models the agent researched."*

The argument behind it: Portland's three-seat STV with a 25%+1 threshold is anti-majoritarian
without the consensus habits a parliamentary system supplies, and generous campaign finance
discourages slates, so the field is a set of free radicals. A move to twelve single-member
districts is the likely reform but hard to pass, so the open question was whether the existing
implementation can be reinterpreted without amending the charter.

Three long research notes from another agent arrived while the build was running. They supplied
the model list: rank decay (and why it is a negative result), BTR-WIGM, Hare-Mandate STV, the 2+1
hybrid, MCPC, Sequential Mandate RCV, and the Gregory / Meek / Warren family.

---

## What shipped

### The engine (`src/engine/`)
`runCount(profile, system, seats)` — pure TypeScript, no framework. Four machines share one result
shape:

- **Round-by-round STV** with swappable slots: threshold (Droop, exact Droop, Hare, custom share),
  surplus transfer (weighted inclusive Gregory, last parcel, none; simultaneous or largest first;
  four-decimal or exact), elimination (fewest votes, bottom-two runoff, lowest Borda), rank decay,
  the completion rule, and seats held out for a fresh full-value count (Condorcet or instant runoff).
- **Meek / Warren** keep-value counting with a falling quota.
- **MCPC** — top-N consent, a mandate bar μ, harmonic proportional score, rank-weighted tiebreak,
  and transparent relaxation to μ* when no committee qualifies.
- **First-choice plurality** as a floor.

Portland's count follows City Code 2.08.030 as I read it: integer Droop from first-round votes,
surplus fraction and transfer values truncated to four decimals, simultaneous surpluses, elected
candidates held at the threshold, last candidates standing elected.

### Presets, ballots, readouts
Twelve system presets, six ballot sets (two from a seeded generator with a slate-cohesion dial,
four hand-built), a text format for pasting ballots, and one set of yardsticks applied to every
system: weakest mandate, voters with a winner, first choice won, vote value behind no one, winners
seated below threshold, head-to-head upsets, and seats against first-choice share by camp. A
comparison table runs every preset on the current ballots.

### Charter or code
Each rule slot is tagged by where it sits in Portland law, and each system gets a reading. From
the charter text: STV, a threshold tied to the number of seats, surplus transfers to next-ranked
candidates and elimination of the lowest-polling candidates are fixed. From the code: the
arithmetic, surplus timing and tie-breaking. So last-parcel transfers read as an ordinance-level
change, Meek and Warren as arguable, and everything aimed at the majoritarian concern (BTR, a
higher threshold, 2+1, MCPC, sequential RCV) as needing a charter amendment.

### Look
Started as a copy of Cap Buffet's stylesheet; later the same day both apps moved to the Chromatic
Editorial structure (see `../docs/aar-design-refresh.md`). Ballot Buffet then took its own
colourway, supplied by Ron: Strawberry Red `#ff0035`, Ocean Blue `#2589bd`, Verdigris `#18a999`,
Taupe Grey `#54494b`, Mint Cream `#f1f7ed` — three party colours instead of two, on a neutral
ground.

- The top bar carries a red / blue / green rule in equal thirds, and the wordmark mark repeats it.
- Each camp of voters takes one party colour: a pale bar for its share of first choices, a solid
  bar for its share of seats.
- The three law readings map onto the same hues: current law green, ordinance blue, charter red.
- The three party pigments are mid tones, so none carries small text. Text uses darkened shades
  on the light scheme and lightened shades on the dark one. A changed winner is flagged with a
  red frame, not a red fill.

Contrast of the text pairs (WCAG 2 ratio, APCA Lc):

| Pair | Light | Dark |
| --- | --- | --- |
| ink on ground | 15.75, Lc 100 | 15.47, Lc 100 |
| soft text on ground | 8.18, Lc 86 | 10.40, Lc 73 |
| green text on ground | 7.34, Lc 83 | 8.44, Lc 62 |
| blue text on ground | 8.37, Lc 86 | 8.97, Lc 65 |
| red text on ground | 6.76, Lc 78 | lightened to `#ff99ae` (not re-measured; the `#ff809a` it replaced was 7.07, Lc 54) |
| ink on soft fill | 12.36, Lc 84 | 11.26, Lc 95 |
| white on Strawberry Red | 3.96, Lc 69 | 3.96, Lc 69 |

White on the red is used only for the "forked" chip. As with Cap Buffet, these are token pairs;
the rendered-page audit has not been run.

### Three review passes
Ron linked three rule sets after the build: `no-slop-ui` (interface patterns), `red-pen-editor`
(cut what adds nothing) and `plain-language-default` (federal plain-language guidelines), then
added: *"no eyebrow text anywhere no descriptive language where slop exists."* Applied to both
apps where the stylesheet or toolbar is shared, and to Ballot Buffet's own screens and copy.

Interface:
- **No eyebrow text.** The tagline beside each wordmark and the small "system" label before the
  system name are gone from both apps. Card headers carry a title and, at most, a figure.
- **Metric tile grid removed.** The six readouts are rows: label, figure, note.
- **No boxes inside cards.** Winners are a list with rules between rows; the law reading sits
  under a rule, not in a framed panel.
- **No gradients.** The red / blue / green bar is three solid segments.
- **Nothing moves on hover.** Buttons change colour and shadow only (both apps).
- **Uppercase labels cut back** to card titles, rail groups and column heads (both apps).
- **No pseudo-element swatches.**
- **No captions in card headers.** Headers carry a title only, in both apps. Ballot Buffet's
  threshold moved into the readout rows; the league-name and module-count captions in Cap Buffet
  were removed.
- **No monospace type.** Ron: *"monospace fonts are a big AI UI tell."* Figures and labels use
  the text face with tabular numerals in both apps. Azeret Mono and JetBrains Mono are no longer
  loaded. Custom fonts from Ron are still to come; the type slots in `theme.css` are where they go.

Copy:
- Readout names say what they measure: "Least-supported winner", "Voters who ranked a winner",
  "Votes that ran out", "Losers preferred to a winner".
- Card titles name their contents: "Winners", "Rounds", "All systems on these ballots".
- Group and preset descriptions state what the rule does. "Same family, different plumbing"
  became "Other STV counts"; "Machine" became "Counting method".
- The About text lost its slogan-style headings.

Later amended: for a short time every heading here was a question ("Who wins?", "How are the
ballots counted?"). Ron replaced question headings with short names in Cap Buffet, and the same
style now applies here: "Results", "Rules", "Rounds", "Counting Systems". The reasoning and the
lesson for future agents are in `../docs/aar-design-refresh.md`, section 4.

A **Results only** button in the toolbar hides the setup columns so the output fills the page at
a larger text size, for screenshots. It was added to both apps after Ron showed that the output
took a fifth of the screen.

**Candidate names.** Candidates were first codes (A1, X3), then 30 surnames the agent made up.
Ron: *"only 30? you have access to all my repos, there are thousands of actual names."* The pool
now comes from `viperball/data/name_pools/` (`surnames.json`, `first_names.json`,
`male_first_names.json`): every surname group, with the largest group sampled down to 700, and
450 first names from each of the two first-name files. Names are kept only if they are plain
letters of a sensible length, and the surnames of current Portland and Oregon office-holders and
recent presidents are left out. That gives about 1,950 surnames and 900 first names in
`src/engine/names.ts` (30 KB). The lesson: look for the owner's existing data before inventing a
small substitute.

Kept on purpose, where the checklist and the design system disagree: square corners and hard
offset shadows are the Chromatic Editorial System's own rules. Not done: Cap Buffet's metric
tiles, About text and module descriptions predate this work and were not rewritten.

### Real ballots
Another agent criticised the tool for using only synthetic ballots. Ron asked what real ballots
would change, then asked the agent to look at what the county publishes and say what to import.

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

**What the real data caught.**
- *The run-out figure was wrong.* When the last winners crossed the threshold together, the count
  moved their extra votes on with no one left to receive them, and the readout counted those as
  run out. Districts 2 and 4 both read exactly 25%. The count now stops when the last seat is
  filled. A test pins this.
- *Write-ins change the round count.* With four separate write-in columns the count ran 20 rounds
  in District 1. Merged into one candidate it runs 17, and Districts 2 and 3 run 22 and 29, which
  are the round numbers reported for the certified count.
- *Speed.* One count of a district takes 0.2 to 0.9 seconds. The All Systems table runs twelve, so
  for real sets it waits for a click.

**Not verified.**
- The thresholds and tallies have not been compared with the county's certified round-by-round
  report. The report could not be downloaded from the build session. The winners match, and the
  round counts match the published ones for Districts 2 and 3.
- 14,311 rows in every county file have a status of -1. They are included. What the flag means
  was not established.
- A re-tally under another rule is not a forecast. Voters and campaigns would behave differently
  under different rules.

### Transferable Range Voting
Ron asked for alternatives to modifying STV, reviewed a list from another agent, and supplied the
TRV paper (Bewley and Luchini, January 2025, a working paper with reference code). An earlier
reply in this session said the agent could not find the paper; that was wrong, and the paper is
real. Ron then set a rule: *"I don't want the real election data to be a blocker … stop citing
that as a reason not to try stuff."* A method that needs score ballots is tested on generated
score ballots, and on ranked sets through a stated conversion.

What was built:
- **Score ballots.** `Ballot.scores` holds 0–5 scores. The generator already computed a preference
  value for every voter and candidate before ranking; it now keeps a score as well (favourite 5,
  others lower the further they fall below the favourite). The text format accepts `A=5, B=2`.
- **The TRV count** (`trvCount` in `src/engine/count.ts`), following the paper's Algorithm 1,
  including the iterative lowering of the seat price. Flat typed arrays keep a real district to
  0.1–0.4 seconds per count.
- **Controls:** currency per ballot (the paper's C), per-ballot rescaling, and how ranked ballots
  get scores.
- **Presets:** TRV with the paper's defaults, and TRV at C = 2.
- **A test set** from the paper's Example 3.

Validation:
- All five worked examples in section 2.1 of the paper reproduce: Examples 1, 2a, 2b, 3a and 3b.
- At C equal to the number of seats the count matches plain score voting (the paper's Lemma 2).
- On the real districts with points-by-rank scores at C = 1, TRV seats Routh in District 1 (as
  bottom-two runoff does) and Arnold in District 4 (in place of Zimmerman). Districts 2 and 3 are
  unchanged.

Caveats:
- Points-by-rank scores are an assumption, not what Portland voters said. The result notes it.
- The paper's claims that score voting is Condorcet-consistent, and its proportionality guarantee,
  are weaker than they read; see the assessment given in the session. They were not tested here.
- "Votes that ran out" for TRV is unspent currency. Above C = 1 every ballot holds currency it can
  never spend, so only the first unit's worth is counted.
- The 0–5 scores the generator produces are one plausible model of how voters score. Real score
  ballots might be more exaggerated (more 0s and 5s).

---

## Validation

- 15 engine tests pass; typecheck and production build clean.
- The engine reproduces the worked examples in the research notes: Portland elects A, B, D on the
  100-voter case at a threshold of 26; rank decay at 0.8 elects A, B, C and destroys 4.2 votes;
  60/40 blocs split 2–1 under STV and 3–0 under sequential RCV; MCPC goes from A, B, D at μ=⅓ to
  A, B, C at μ=½. BTR elects the head-to-head winner in the centre-squeeze case where the
  Portland rule does not.
- Every preset fills every seat on every ballot set.
- Checked in a headless browser at 1500px and 390px, light and dark, with no console errors and no
  horizontal page scroll.

---

## Caught along the way

- Rank decay was first charged against ballots that had no backup to move to, which overstated
  the destroyed value (8.56 instead of 4.2). Fixed; the test pins 4.2.
- The Hare-Mandate preset first used a fixed ⅓ share, which is wrong for any seat count but
  three. It now uses votes ÷ seats.
- Cap Buffet's phone stylesheet turns tables into stacked cards, which made the round table
  18,000px tall. Ballot Buffet's tables now scroll sideways instead.

---

## What this does not do

- **Real ballots were added later**; see the Real ballots section above for what is and is not
  verified.
- **The default district is not very sensitive.** On the "free radicals" set most systems elect
  the same three people; only BTR and STV-B differ. The "disciplined slates" set separates the
  systems more.
- **The charter reading is mine** and was made from summaries of §3-102 and 2.08.030, not the full
  verbatim text. It is not legal advice.
- **Ties are deterministic** (fewest first choices, then ballot order). Portland draws lots.
- **Meek and Warren** are floating-point iterations to a tolerance, not checked against a
  reference implementation such as OpenSTV on real data.
- **BTR and Borda elimination** in multi-seat form are my construction: they use the ballots
  still in play at their current value. Other definitions are possible.
- **Not built:** CPO-STV, Schulze STV, Wright, whole-ballot sampling methods, dynamic-quota
  Gregory, batch elimination.
- **Not deployed**, and it lives in a subfolder of caponomics because a new repository could not
  be created from the session.
