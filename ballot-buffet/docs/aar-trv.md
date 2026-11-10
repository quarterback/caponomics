# After-Action Report — Transferable Range Voting and score ballots

**Date completed:** 2026-11-10
**Branch:** `claude/peaceful-faraday-35fzk2` (in `quarterback/caponomics`, folder `ballot-buffet/`)

Continues `aar-real-ballots.md`.

---

## What was asked for

Ron asked for alternatives to modifying STV, reviewed a list from another agent, and supplied the
TRV paper (Bewley and Luchini, January 2025, a working paper with reference code). An earlier
reply in this session said the agent could not find the paper; that was wrong, and the paper is
real. Ron then set a rule: *"I don't want the real election data to be a blocker … stop citing
that as a reason not to try stuff."* A method that needs score ballots is tested on generated
score ballots, and on ranked sets through a stated conversion.

---

## What shipped

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

---

## Validation

- All five worked examples in section 2.1 of the paper reproduce: Examples 1, 2a, 2b, 3a and 3b.
- At C equal to the number of seats the count matches plain score voting (the paper's Lemma 2).
- On the real districts with points-by-rank scores at C = 1, TRV seats Routh in District 1 (as
  bottom-two runoff does) and Arnold in District 4 (in place of Zimmerman). Districts 2 and 3 are
  unchanged.

---

## What this does not do

- Points-by-rank scores are an assumption, not what Portland voters said. The result notes it.
- The paper's claims that score voting is Condorcet-consistent, and its proportionality guarantee,
  are weaker than they read; see the assessment given in the session. They were not tested here.
- "Votes that ran out" for TRV is unspent currency. Above C = 1 every ballot holds currency it can
  never spend, so only the first unit's worth is counted.
- The 0–5 scores the generator produces are one plausible model of how voters score. Real score
  ballots might be more exaggerated (more 0s and 5s).
