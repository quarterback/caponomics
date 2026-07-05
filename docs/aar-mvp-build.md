# After-Action Report — caponomics MVP: cap-system constructor + compliance checker

**Date completed:** 2026-07-05
**Branch:** `claude/arcane-salary-cap-tool-iko1n6`
**Commits (in order):**
- `c119e6f` — Add MVP plan: sport-agnostic salary-cap system constructor
- `1579e05` — Build caponomics MVP: cap-system constructor + compliance checker
- `53e7389` — Make deploy-ready for Vercel and Netlify

This is the first real code in `caponomics` — the repo was a bare README
(`# caponomics` / "Salary Cap Imagineering") before this. Full design plan lives
alongside this file in `docs/mvp-plan.md`.

---

## What was asked for

The brief arrived as a thinking-out-loud prompt, not a spec: *"imagine a tool
where I can devise a variety of arcane salary caps based on not just existing
models but ones that might not exist already. not sure if it's worth it or even
how it'd look."* Paired with a stack of NBA/MLB cap articles and links to
PuckPedia and SalarySwish.

It sharpened over the conversation into a clear thesis:

- Not a cap tool for one sport — a **cap *generator***. *"rather than picking one
  sport, you'd want a cap generator that would let anyone devise a cap system of
  their dreams… like the nba trade machine but just for salary cap complexity
  and construction."*
- **Mix-and-match across leagues is the point.** *"What would a second apron look
  like in the NFL? What if NBA teams had to use the hockey cap? We'd get to find
  out."* MLS, NWSL, PWHL explicitly requested alongside the big four.
- **A calculator, not a prescription** — computes consequences, doesn't judge a
  design as good or fair.
- **Financials are arbitrary.** *"you could imagine a minor league with a strict
  cap trying to use this… A-League in Australia? Canadian Football League?"* Any
  scale, real numbers optional.

Three product forks were put to the user directly and answered: MVP = **Constructor
+ compliance** (not the trade sandbox first); stack = **client-side React/TS/Vite
SPA**; canvas = **sport-agnostic engine with baseball as the flagship**. A design
brief followed and was locked: **polished modern SaaS** (Linear/Stripe/Raycast),
not a terminal — Inter, `#00B7E0` accent, soft cards, app-shell layout. Finally:
*"The goal is to run this off vercel or netlify, not a command-line-only tool."*

---

## What shipped

### 1. A pure, framework-free engine (`src/engine/`)

`evaluateRuleset(league, ruleset) → ComplianceReport`, run per team / per season
year in three phases: **environment** (revenue → cap value) → **charge** (engine
base salary charges first, then module contributions) → **validate** (each module
reads the finished cap sheet). Legality is `AND` across modules; reasons,
penalties, and readouts concatenate in ruleset order. Money is integer dollars
throughout so marginal-bracket math is exact.

The load-bearing decision, carried over conceptually from the Lottery Lab's
`Protocol` + `ALL_SYSTEMS`/`SYSTEM_MAP` registry: **a flat catalog of small module
objects keyed by a string `kind`.** Inventing a mechanic is one file plus one
array entry. Thirteen modules shipped: `revenuePool`, `capFormula`,
`allocationPool`, `hardCap`, `salaryFloor`, `luxuryTax`, `apron`, `maxContract`,
`minimumSalary`, `rosterLimits`, `draftPickPenalty`, `retainedRights`,
`passThrough`.

### 2. Rulesets are plain JSON, decoupled from rosters

A `Ruleset` is an ordered list of `{kind, enabled, params}` — that *is* the
invented cap system. `serialize.ts` round-trips it, drops unknown module kinds,
backfills missing params from schema defaults, and base64-encodes it into a URL
hash for sharing. A roster is an independent `League`. Because
`evaluateRuleset(league, ruleset)` takes any pairing, cross-league remixing falls
out for free rather than being a feature bolted on.

### 3. Eight presets — the "leagues are just data" proof (`src/presets/`)

MLB-2026 (hero, full detail), NBA-2026 (two apron instances + nested pick
penalty), NFL, NHL, MLS + NWSL (allocation-money shape), PWHL ("hello world"
minimal cap), and Blank. That the four majors reduce to preset data is the
validation that the generator is real and not a mock.

### 4. The SaaS app shell (`src/ui/`)

Toolbar · left sidebar (preset rail + roster picker + module palette) · workspace
(ruleset builder as editable accordion cards) · right compliance panel (verdict
banner, penalty chips, notes, metric tiles, grouped cap sheet). The property
inspector is **schema-driven** — `ParamForm` renders controls from each module's
`paramSchema`, so an invented module is editable with zero bespoke UI. Light/dark
themes, `#00B7E0` accent, Inter throughout with mono reserved for figures. Two
remix demos wired into a menu ("NBA rosters under the NHL hard cap", "MLB + a
grafted second apron").

### 5. Deploy-ready (`53e7389`)

`vercel.json` and `netlify.toml` committed; `engines.node >=18` pinned; README
documents the one-click import path. Static build serves at a domain root or a
subpath (`base: './'`).

---

## Validation

Honest account of what was actually exercised:

- **24 Vitest unit tests, all green.** Includes exact luxury-tax marginal math
  ($265M under the MLB brackets owes precisely $5.6M; $300M owes $20.4M; repeater
  surcharge stacks correctly), the three-phase pipeline (blank ruleset still
  yields a cap sheet; hard-cap breach → one error; floor shortfall → exact-gap
  penalty), `maxContract` + `retainedRights` exemption, serialize round-trips, and
  a headline preset-acceptance suite (Dodgers illegal over cap + top tier, Yankees
  legal-in-tax, Rays/A's below floor; NBA sample crosses the apron ladder; **NBA
  roster under the NHL cap → every team illegal**).
- **`tsc -b` clean** under `strict` + `noUncheckedIndexedAccess`.
- **Production build succeeds** and was **driven in a real browser** (headless
  Chromium via Playwright): default MLB view, a team switch to an illegal state,
  a module expand, loading a remix through the menu, and a dark-theme render.
  Screenshots captured. One console 404 (favicon) was found and fixed.
- **Preview server** verified to serve root, deep-path SPA fallback, and hashed
  assets (all 200).

---

## What I did NOT do (be clear about the edges)

- **No live deployment.** The environment has no Vercel/Netlify token — that step
  links the user's account via OAuth. I made the repo turnkey and stopped; the
  user elected to connect Netlify themselves. So there is **no live URL yet**.
- **No trade/transaction sandbox.** This is the big deferred half. It's why
  several things below are informational rather than enforced. Engine signatures
  (`transform`, `Transaction`) are reserved but unimplemented.
- **Cap hits are input data, not derived.** `salaryByYear` is the already-prorated
  number. NFL signing-bonus proration / void-year dead money and NHL buyouts are
  **not computed** — the NFL/NHL presets acknowledge this with a `passThrough`
  note rather than faking it.
- **Apron restrictions and draft-pick penalties are informational.** They
  constrain *transactions*, which don't exist yet, so being over an apron surfaces
  warnings + the active restriction set, not hard illegality.
- **`retainedRights` is declarative** — it exempts a designated player from the
  max; it does not model real re-signing exception logic.
- **Preset figures for MLS / NWSL / PWHL are illustrative**, flagged in-comment as
  "tune to your own." The MLB/NBA numbers are close-to-real but still illustrative
  — this is a calculator, not a rulebook.
- **Single-year compliance view.** Types carry year-indexed series, but the UI
  shows one season year. No multi-year projection UI.
- **No side-by-side system comparison** yet (the natural second flagship view).
- **No PR opened, not merged to `main`.** All work sits on the feature branch.
- **No dev-site card.** Adding `projects/caponomics.html` to the portfolio hub is
  deferred until there's a live URL to point at.

---

## Decisions & trade-offs worth remembering

- **Registry-of-modules over a monolithic rules engine.** The whole bet is that
  cap systems decompose into ~20 reusable primitives; the research confirmed the
  four majors are expressible as compositions of them. If that abstraction ever
  strains (e.g. a mechanic that needs cross-team global state), the phase model is
  where to extend, not the module interface.
- **Phase-ordered, not strictly ruleset-ordered, evaluation.** Modules declare a
  phase so thresholds always see the cap value, while the ruleset stays a flat
  ordered list the user reorders freely. This keeps "ruleset = ordered list" true
  without letting a user footgun a percent-of-cap apron above its cap formula.
- **Hand-rolled CSS + primitives, no component library.** The design brief wanted
  a specific premium feel; a token system + small primitives (segmented control,
  switch, chips, accordion, money input) hit it with a ~61KB gzipped JS bundle and
  no framework lock-in. Radix was planned as optional and ultimately not needed.
- **Scale-agnostic money, deliberately.** No assumption of real-world magnitude —
  an NBA roster under a PWHL cap producing "everyone illegal" is the *right*
  answer, not a units bug, and the tool says so plainly.

---

## Next steps (unprioritized)

1. Get it live (user connecting Netlify; offer to merge to `main` so prod tracks
   `main`).
2. The **transaction sandbox** — the deferred half that gives aprons, dead money,
   buyouts, retention, and exceptions their teeth.
3. **Side-by-side comparison** of two `ComplianceReport`s (the diff view the
   engine's shape already anticipates).
4. Multi-year projection UI.
5. Roster editing beyond the samples (paste/import a roster; add/cut players).
6. dev-site project card once there's a URL.
