# After-Action Report — Workarounds, East-Asian leagues, mobile, and the Cap Buffet identity

**Date completed:** 2026-07-05
**Branch:** `claude/arcane-salary-cap-tool-iko1n6` (PR #1)
**Key commits (in order):**
- KBO/NPB leagues + won/yen currencies
- Responsive mobile layout
- Workaround modules + dead-money toggle + disparity readout + MLB CBT preset
- Over-Cap Exception + Designated Player workarounds
- Rebrand to **Cap Buffet** + self-hosted brand fonts

Continues `aar-league-scale-and-currency.md`. Two threads dominate this stretch: a
conceptual breakthrough about **cap workarounds**, and the tool getting a **name
and a face**.

---

## What was asked for

Loosely, in order:
- Add the East-Asian baseball leagues after a "does NPB / KBO have a cap?" exchange.
- Make it work on a phone (a screenshot showed the desktop grid overflowing badly).
- *"the workarounds are really what makes salary caps what they are… I'd want to
  explore the various workarounds that aren't themselves rules, just ways to
  circumvent or at least extend a cap like Bird rights, franchise players…"* —
  the most important design conversation of the project.
- Build "batch 1–3 + a dead-money toggle," and add the real current MLB luxury tax
  (which was missing — only the 2026 *proposal* was in).
- Then the two workaround modules that fit the model (Exception, Designated Player).
- Buy fonts, decide how many, wire them up.
- Rename the tool to **Cap Buffet**.

---

## What shipped

### 1. The workaround abstraction (the intellectual core)
The key realization, worked out in conversation: **a cap workaround isn't a rule —
it's a transformation on money that would otherwise count against the cap.** Every
real circumvention is one of five moves: **exclude, discount, raise-the-ceiling,
time-shift, transfer.** And crucially, at this tool's league-wide compliance level
you don't need a trade machine to model them — you model them as **policies with a
selection rule** (top-N, own-player, over-threshold) applied to every team.

Built three of the five transforms, in a new **"Exceptions / workarounds"** palette
category:
- **Amnesty** (exclude) — each team drops its N biggest cap hits. Charge-phase
  module that reclassifies existing charges in place.
- **Over-Cap Exception** (raise-ceiling) — Bird/MLE: grants over-cap room a hard
  cap consumes; no effect in a soft-cap system (correct). $12.8M drops NFL
  over-cap teams 9 → 1.
- **Designated Player** (discount) — MLS: top-N salaries count only a fixed budget
  charge. Collapses Inter Miami ~$40M → ~$19M. MLS preset switched to use it.

Engine change: charge-phase modules may now reclassify existing charges (totals
recompute after each). `retainedRights` was already the seed (a re-sign exception);
this generalized the idea.

### 2. Dead money, position caps, disparity, real MLB CBT
- **Dead Money** — injects a per-team dead-money charge with a toggle for whether
  it counts against the cap (the "does this system count dead money" question,
  minus the transaction layer).
- **Position Sub-Cap** — limits spend on a position group (roster-balance shape).
- **Top vs bottom** — a payroll-disparity ratio added to the league summary.
- **MLB Luxury Tax (current CBT)** preset — the *actual* system (tax tiers
  20/32/62.5/80 + Cohen-tier draft drop), distinct from the 2026 cap/floor proposal.

### 3. KBO + NPB + won/yen
- **KBO** (won) with a real soft-cap preset — a ~₩11.4B cap on top-40 salaries, a
  50% overage levy, and a 9-spot first-round draft drop: the money-plus-asset
  penalty combo made concrete.
- **NPB** (yen) with a "no cap" preset (the truth), foreign-player limit noted.
- **KRW / JPY** currencies with East-Asian myriad grouping (억/만, 億/万) and FX;
  `parseMoney` accepts 억/億/만/万. New "Asia" roster group.

### 4. Responsive mobile
The three-column shell now collapses to a single-column stack ≤760px: wrapping
toolbar, compact chip pickers, and the league table **reflowed into per-team
cards** (labeled rows). Fixed a real bug — the shell's implicit grid track was
sizing to a `nowrap` module blurb (~914px) and stretching the whole page; pinned
the track to the viewport.

### 5. The Cap Buffet identity
- Renamed **caponomics → Cap Buffet** (wordmark, title, meta/OG, About, README).
  The name fits the thesis — a *buffet* of caps to mix and match.
- **Self-hosted, licensed type system** (no CDN), three roles:
  - **Amerik** → the wordmark (athletic display).
  - **Overbit** (Regular) → the figures/mono face — *all* money renders in its
    retro pixel-scoreboard style; JetBrains Mono kept as a glyph fallback (CJK).
  - **General Sans** (400/500/600/700) → the UI workhorse, replacing Inter.
- Regenerated the OG share card with the new name and fonts.
- Earlier: a favicon (`capseye.png`, the user's eye/$ artwork) and the OG card
  itself were added.

---

## Validation
- **39 Vitest tests pass** (added: amnesty exclude, dead-money counts toggle,
  position sub-cap, MLB CBT top-tier tax, exception raise-ceiling + soft-cap no-op,
  DP discount). `tsc -b` clean; production build clean.
- **Driven in headless Chromium** throughout: KBO in won (₩132억, ₩9.1억 levy +
  asset penalty), the NFL exception 9→1, MLS DP discount, mobile at 390px (no
  horizontal overflow, cards render), and every font role computed-style checked.

---

## Decisions & trade-offs
- **Workarounds as transforms, not a sandbox.** This is what let the whole family
  fit the league-wide model without a trade machine — and it stays true to the
  user's earlier "not a contracts simulator" steer. The five-transform taxonomy is
  the durable idea here.
- **Policies, not clicks.** Workarounds auto-apply per team by a selection rule, so
  they scale to 30 teams instead of needing per-player designation.
- **Overbit for *all* figures.** A bold, opinionated call the user directed — money
  in a pixel font reads as a scoreboard, which suits "Cap Buffet." Columns still
  align (right-aligned + monospaced digits).
- **General Sans over Inter.** Once all four weights arrived, it became the UI face
  wholesale; Inter dropped from the bundle.

---

## Reserved / deferred (be honest)
- **Two transforms unbuilt: time-shift (proration/void years) and transfer (salary
  retention).** Both genuinely need structural features this tool lacks — a
  **multi-year axis** (contracts as year-series + a year selector) and, for
  transfer, a multi-team money split. Faking them single-year would just be a worse
  Designated Player. The multi-year axis is the next big rock; it also unlocks the
  **repeater tax** and cap-growth curves.
- **Nationality-based composition** (NPB's 4-foreign-player rule) needs a player
  tag the generator doesn't produce; only position-based composition shipped.
- **Overbit Shadow Bold** is bundled but unplaced — a reserve awaiting a home.
- **No transaction sandbox** (unchanged stance) — cap hits stay input data.
- **Deploy:** now live on **Vercel** (user connected it); OG image is still
  root-relative (swap to absolute once the final domain is set). Not merged to
  `main` yet.

---

## Next steps (unprioritized)
1. The **multi-year axis** — unlocks proration/void-years, retention, repeater tax.
2. Find a home for Overbit Shadow (or drop it).
3. Absolute OG URL + merge PR #1 to `main`.
4. Side-by-side comparison of two systems.
5. A composition module keyed on player tags (foreign, homegrown) once tags exist.
