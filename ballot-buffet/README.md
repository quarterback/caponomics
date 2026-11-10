# Ballot Buffet

**Transferable-vote imagineering** — a fork of Cap Buffet's idea, pointed at ranked-choice voting.
Compose a single-transferable-vote count out of interchangeable rules, load any set of ballots, and
see who wins and what it cost. Portland's 2024 count is one preset among twelve.

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

## Ballot sets

- **Free radicals / Disciplined slates** — a seeded synthetic district (3,000 voters, 18 candidates,
  three camps) at low and high slate cohesion. Cohesion, field size, bullet-voting rate, ranking limit
  and camp sizes are all sliders.
- **Seven small candidates, one backup** — the 100-voter case where rank decay flips a 26–22 majority.
- **60 / 40 blocs** — proportional 2–1 versus a majoritarian sweep.
- **Majority that won't rank** — 56% wins one seat of three.
- **Center squeeze** — one seat; the head-to-head winner has the fewest first choices.

Or paste your own: one line per group, `26: A > B > C`.

## Readouts

Winners and how each was seated, weakest mandate (top-three support of the least-supported winner),
voters with a winner on their ballot, vote value behind no one, winners seated below the threshold,
head-to-head upsets, seats versus first-choice share by camp, the full round-by-round table, and every
preset run on the same ballots side by side.

## Charter or code

Each rule is tagged by where it lives in Portland law, and each system gets a reading: current law,
changeable by ordinance, or needs a charter amendment. Charter §3-102 fixes STV, a threshold tied to
the number of seats, surplus transfers to next-ranked candidates and elimination of the lowest-polling
candidates; City Code 2.08.030 holds the arithmetic. This is a plain reading of the text, not legal
advice.

## Known limits

- Generated ballots are synthetic. No real cast vote record is bundled.
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
