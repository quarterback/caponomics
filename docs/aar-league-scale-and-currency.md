# After-Action Report — League-scale pivot, every league, and multi-currency

**Date completed:** 2026-07-05
**Branch:** `claude/arcane-salary-cap-tool-iko1n6` (PR #1)
**Commits (in order):**
- `c6b9e88` — Pivot to league-wide cap analysis; full leagues; About page
- `6a271a4` — Remove stray diagnostic script
- `a9f6aba` — (earlier) OpenGraph share card · `f050d33` — favicon
- `3d6872a` — Add many leagues + multi-currency support
- `89f6283` — Add currency selector + ruleset currency with FX conversion

Picks up where `aar-mvp-build.md` left off (the Constructor + compliance MVP). This
run reshaped the product in response to a sharp piece of user feedback, then scaled
it out.

---

## What was asked for

Three moves, each from a short prompt:

1. **"add more teams? and an about page."** — I added ~6 teams to each of the two
   sample leagues and an About page. That was too timid; see below.
2. **The reframe (the important one):** *"it's really less about players and trade
   machine more about trying to test scenarios across an entire league because
   otherwise the features get redundant with other tools. what you want to model is
   how a cap works and the penalties therein not necessarily a contracts
   simulator."* This corrected the product's center of gravity.
3. **"add all the major sports leagues, wnba, pwhl, and hell go a step further and
   add the major soccer leagues in europe,"** then **"cfl too… a-league in
   australia, india premier league cricket though that'd require adding euros and
   lakh,"** and finally **"there needs to be a currency selector so you can use usd
   in the EPL"** plus *"the ruleset itself carries a currency for the share links."*

There was also a mid-course *"why so few teams?!"* / *"there are more teams what's
the constraint?"* — fair. The constraint was self-imposed: I was hand-typing
rosters. The fix was a generator.

---

## What shipped

### 1. Pivot to a league-wide view (`c6b9e88`)
The primary surface is now a **League Overview**, not a single-team cap sheet:
- `engine/summary.ts` — `summarizeLeague(report)` rolls a `ComplianceReport` into
  league aggregates (illegal / over cap / below floor / in tax + total tax /
  payroll spread / a competitive-balance CV%) plus per-team rows.
- New `LeaguePanel` / `LeagueSummary` / `LeagueTable` (sortable: payroll, vs cap,
  tax, floor, apron, status). The per-team cap sheet is now an opt-in drill-down.
- The app shell reflowed to give the results table the width.
- An **About** page (toolbar) states the philosophy: models the cap and its
  penalties, not the contracts; a calculator, not a prescription.

To keep the league view about *cap dynamics* rather than per-player noise, I spread
generated payrolls across a realistic top-N; that dropped "illegal" teams under the
MLB proposal from 16/30 to a meaningful 7/30 (the genuine over-cap / below-floor /
marquee-max cases).

### 2. Every league, via a generator (`c6b9e88`, `3d6872a`)
`data/rosters/generate.ts` — a seeded (mulberry32) generator: real team names,
generated depth, payroll targets chosen to spread across the cap. Full leagues now:
- **North America:** MLB 30, NBA 30, NFL 32, NHL 32, WNBA 13, MLS 30, NWSL 14,
  PWHL 8, CFL 9
- **Europe:** Premier League 20, La Liga 20, Serie A 20, Bundesliga 18, Ligue 1 18
- **Rest of world:** A-League 13, IPL cricket 10

16 leagues, grouped in the sidebar. Marquee teams (Dodgers, Yankees, Celtics…) stay
hand-tuned so the acceptance tests keep asserting real outcomes. Real cap presets
added for WNBA, CFL, A-League and IPL so each is meaningful on load.

### 3. Multi-currency with FX (`3d6872a`, `89f6283`)
- `engine/format.ts` — currency-aware `fmtMoney`/`fmtMoneyExact` for USD, EUR, GBP,
  AUD, CAD, INR. Rupees render in lakh/crore (₹122 cr); `parseMoney` accepts
  `cr`/`lakh` and symbols. Illustrative FX rates + `fx()`/`fxRate()`.
- **Leagues carry a native currency**; the **ruleset carries a currency** (default
  USD) that is the display/compute unit **and is persisted in shared links** (the
  requested #2).
- The **engine converts each league's payrolls into the ruleset's currency** before
  applying rules, so a cap authored in one currency tests meaningfully against a
  league priced in another (a $200M cap on the EPL converts £ wage bills to $).
- A **toolbar currency selector** switches the currency; switching runs
  `engine/currency.ts::convertRulesetMoney()`, a schema-driven walk that rescales
  only the money-typed params (and bracket money), leaving percents alone — so the
  cap stays economically equivalent. Verified: the EPL's top club reads £409M
  natively, $519M in USD, ₹4325 cr in rupees.

---

## Validation

- **27 Vitest tests pass** (added 3 for FX: a GBP league under a USD ruleset
  converts and goes over cap; same-currency is a no-op; `convertRulesetMoney`
  rescales money + bracket money but not percents). The MLB/NBA acceptance and the
  NBA-under-NHL remix still hold — anchor teams are unchanged and USD↔USD is factor 1.
- **`tsc -b` clean**, **production build clean**.
- **Driven in a real browser** (headless Chromium): 16 grouped leagues load; the
  IPL board renders entirely in crore; the currency selector converts the EPL
  across USD/GBP/INR live. No console errors.

---

## What I did NOT do / what's illustrative (be honest)

- **FX rates and most salaries are illustrative.** The tool is scale-agnostic and
  says so; the numbers are for experimentation, not accuracy. Newer/soccer leagues
  especially are ballpark.
- **Generated depth is fictional.** Marquee teams use real names/salaries; the rest
  of each league is real team names with generated players and payroll-fit salaries.
- **No live deploy yet.** Repo is Netlify-ready; the user is connecting it.
- **Still no transaction sandbox.** Cap hits remain input data; proration / dead
  money / buyouts / exceptions are deferred, and apron/pick penalties stay
  informational.
- **Currency is a single global lens.** You can't show two currencies at once, and
  switching currency rewrites the ruleset's numbers (converts) rather than keeping a
  separate display-only override — a deliberate simplification to avoid an
  edit-vs-display paradox.

---

## Decisions & trade-offs worth remembering

- **The reframe changed the default view, not the engine.** `evaluateRuleset` was
  already league-wide (per team/year); the pivot was mostly a new summary function +
  UI. Good sign the core abstraction was right.
- **Generator over hand data.** Full leagues by hand don't scale and drift into
  error; a seeded generator with per-league profiles (`*_OPTS`) does, and keeps
  reproducibility (fixed seeds, no `Math.random` at eval-affecting points).
- **One working currency, converted at the edges.** The engine computes in the
  ruleset's currency; payrolls convert in (`baseSalaryCharges` × factor) and the
  ruleset's own numbers convert on switch (schema walk). This keeps every
  comparison and every displayed figure — including reason strings — in one
  consistent unit, instead of mixing symbols.
- **Schema-driven money conversion** reuses the same `ParamField` metadata that
  drives the auto-generated forms. One source of truth for "which params are money."

---

## Next steps (unprioritized)

1. Deploy (Netlify, in the user's hands) + merge PR #1 to `main`.
2. Transaction sandbox — the deferred half that gives aprons/dead money/buyouts teeth.
3. Side-by-side comparison of two `ComplianceReport`s (or two currencies at once).
4. Real data import (paste a roster / wage bill) so leagues aren't only generated.
5. League-level levers the reframe invites: team-payroll max/min, competitive-balance
   tax redistribution, a spending-disparity readout.
