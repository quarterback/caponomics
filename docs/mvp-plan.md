# caponomics — Salary Cap Imagineering (MVP Plan)

> Status: **planned, not built.** This document is the approved design plan for the MVP. No
> application code exists yet — this is here to revisit before implementation begins.

## Context

Part of a family of sports simulation tools (Lottery Lab, o27/super-innings, viperball,
pesäpallo/mallo). This adds a new one to that portfolio, living in this repo — whose README
declares the mission: *"Salary Cap Imagineering."*

**The idea:** a **sport-agnostic salary-cap SYSTEM CONSTRUCTOR + compliance checker**. Think
"the NBA Trade Machine, but for cap-*system construction*" (reference points — PuckPedia,
SalarySwish, Spotrac, OverTheCap — are all roster/cap ledgers; this is the layer *above* them:
designing the ruleset itself). A user composes a cap system out of reusable **mechanic modules**
(hard cap, aprons, luxury tax, floor, max-contract rules, exceptions, revenue→cap formula…),
loads a roster, and sees the cap sheet + whether it's legal and what penalties apply.

**Is it worth it? Yes — and here's the proof it's real, not vaporware:** research across
NBA/NFL/NHL/MLB/MLS confirmed that every league's cap is built from the *same ~20 reusable
primitives*. That means **the four major leagues are literally just presets of one composable
kit** — exactly the validation a "generator" needs. And the payoff is the core thesis: because
roster data and ruleset are independent, you can **mix and match across leagues** — *"What would a
second apron look like in the NFL? What if NBA teams had to use the hockey cap?"* — and instantly
find out.

**It's a calculator, not a prescription.** The tool computes the *consequences* of whatever ruleset
you build (cap sheet, tax owed, floor/apron status, legal/illegal + reasons) and passes **no
judgment** on whether a cap design is good, fair, or wise. Legality is objective; everything else is
just numbers you can read. (Deliberate contrast with the Lottery Lab, which color-codes metrics
good/bad — caponomics does **not** editorialize on cap-design quality.)

**Financials are arbitrary — any scale is first-class.** Real-world magnitudes are illustrative, not
required. The natural audience isn't only the big leagues: a **minor league** writing its own strict
cap, the **A-League (Australia)**, the **CFL**, an indie/fantasy/beer league — set the cap to $40 if
you want. This is precisely why roster and ruleset are decoupled with explicit scale-normalization
(below): the engine assumes nothing about real-world dollar amounts.

**Locked-in decisions:**
- **Stack:** full client-side SPA — **React + TypeScript + Vite**. No backend; all cap math runs
  in-browser in TypeScript. Deploys as a static site (Vercel/Netlify/Pages).
- **MVP scope:** **Constructor + compliance ONLY**. Two panels: A = build/parameterize your cap
  system; B = load a roster → cap sheet, tax owed, floor/apron status, legal/illegal + reasons.
  Trade sandbox and side-by-side comparison are designed-for but **deferred**.
- **Canvas:** sport-agnostic engine, **baseball as the flagship** (MLB-2026 proposal as the hero
  preset — a blank-slate "what if MLB had a cap"). Ships with NBA/NFL/NHL + **MLS/NWSL/PWHL** + a
  blank "invent-your-own."
- **Headline feature:** **cross-league remixing** — fork any preset, graft/swap individual modules
  regardless of origin sport, run any roster against any ruleset.

## Architecture — mirrors the Lottery Lab spine, translated to TypeScript

The load-bearing pattern copied from `Lottery/artifacts/lottery-lab/`: **one small module object per
mechanic, registered in a flat catalog keyed by a string `kind`.** In Lottery Lab this is the
`LotterySystem` Protocol + `ALL_SYSTEMS`/`SYSTEM_MAP` registry (`engine/lottery_sim.py`) and the
frozen `LeagueConfig` + `LEAGUES` dict (`engine/leagues.py`). Here:

| Lottery Lab (Python) | caponomics (TS) |
| --- | --- |
| `LotterySystem` Protocol | `CapModuleDef` interface (`src/engine/module.ts`) |
| `ALL_SYSTEMS` / `SYSTEM_MAP` | `MODULE_CATALOG[]` / `MODULE_MAP` (`src/engine/catalog.ts`) |
| frozen `LeagueConfig` threaded through | `Ruleset` (plain JSON) threaded through `evaluate()` |
| `HISTORICAL_SEASONS` plain literals | `src/presets/*.ts` + `src/data/rosters/*.ts` literals |
| "add a system = one entry" | "invent a mechanic = one catalog entry" |

**The engine is pure** (`League + Ruleset → ComplianceReport`, no React, no I/O) so it's
unit-testable in isolation and reusable by the future sandbox/comparison tools.

### Core types (`src/engine/types.ts`, `src/engine/module.ts`)
- **Money = integer dollars** (never floats) so marginal-bracket math is exact.
- `Contract{ playerId, years[], salaryByYear, signingBonus?, guarantees?, clauses?, acquiredVia? }`
- `Team{ id, name, roster: Contract[], cashSpendByYear?, flags[] }`; `League{ players, teams[], seasonYears[] }`
- `CapCharge{ year, amount, type: base|proration|deadMoney|bonus|retained|hold, countsTowardCap, sourceModule }`
- **`Ruleset`** = `{ schemaVersion, id, name, seasonYears[], modules: ModuleInstance[] }` —
  **an ordered list of `{ id, kind, enabled, params }`. This IS the invented cap system**, plain JSON,
  save/share via file download or base64 URL-hash.
- **`CapModuleDef`** = `{ kind, label, category, phase, blurb, paramSchema: ParamField[], defaultParams,
  computeEnvironment?(), contributes?(), validate?() }` — plus reserved `transform?()`/`project?()`
  signatures for the deferred sandbox/projection (so they slot in without reshaping the interface).
- **`ParamField`** discriminated union (`money|number|percent|boolean|enum|enumMulti|bracketList`) —
  drives **schema-generated forms** so a new module needs zero UI code.

### Evaluation pipeline (`src/engine/evaluate.ts`)
`evaluateRuleset(league, ruleset)` runs **per team, per season-year**, in three phases —
**phase-first, then Ruleset order within a phase** (keeps "Ruleset = ordered list" true while
guaranteeing thresholds see the cap value):
1. **environment** — `revenuePool` → `capFormula` populate `env.capValue`.
2. **charge** — engine emits **built-in base charges** from `Contract.salaryByYear` first (so even a
   *blank* ruleset yields a cap sheet), then `contributes` modules adjust.
3. **validate** — each `validate` module reads the finished cap sheet + `env.capValue` → `ModuleResult`.

Combination: `legal = AND(all modules)`; reasons/penalties/readouts concatenated in Ruleset order.
Three **penalty currencies** — money (tax $), assets (draft picks), tools (lost exceptions).

## MVP module subset (`src/engine/modules/`)

Exactly enough to express the **compliance** (not transactions) of all presets, plus escape hatches:

`revenuePool`, `capFormula`, `hardCap`, `salaryFloor`, `luxuryTax` (marginal `brackets[]` + repeater
surcharge), `apron` (over-threshold flags + `restrictions[]` chosen from a shared enum in
`data/enums.ts`), `maxContract` (%-of-cap tiers by service + merit bumps), `minimumSalary`,
`rosterLimits`, `draftPickPenalty` (spend-linked asset freeze; standalone or nested in apron),
`retainedRights` (declarative — exempt a designated "cornerstone/Bird" player from the max),
`allocationPool` (MLS/NWSL-style spendable pool that raises a team's effective cap — small addition
so soft-cap-with-money systems express cleanly), and `passThrough` (documents an unmodeled mechanic;
always legal — the generic escape hatch used by NFL/NHL for proration/LTIR in MVP).

**Deferred module plug-in points** (reserved, not built): `tradeMatch`, `bonusProration` (derivation),
`deadMoney` (derivation), `buyout`, `salaryRetention`, `exception` (MLE/BAE/Room/DPE), `rookieScale`,
`tag`, `injuryRelief`, `bonusOverage/escrow`. All register the same way and implement
`transform`/`contributes` — the future sandbox feeds them `Transaction` objects.

## Presets (`src/presets/`) — the "leagues are just data" proof

`presets/index.ts` exports `PRESETS[]` + `PRESET_MAP` (mirrors `LEAGUES`). Each is a `Ruleset` literal.

- **`mlb2026.ts` (HERO — full detail):** `revenuePool`(~48%) → `capFormula`(soft $240M) →
  `hardCap`($300M) → `salaryFloor`($100M, penalty=payShortfall) → `luxuryTax`(3 marginal tiers
  20/32/50% + repeater) → `maxContract`(15%→16% of cap by service) → `retainedRights`(Cornerstone
  exemption) → `minimumSalary`($780K) → `rosterLimits`(24–26). Exercises every scoring path.
- **`nba2026.ts`:** soft cap (no hardCap) + `salaryFloor`(90% of cap) + `luxuryTax`(incremental +
  repeater) + **two `apron` instances** (1st: `takeBackLimit,noSignAndTrade`; 2nd:
  `frozenDraftPick,noAggregation`) + nested `draftPickPenalty` + `maxContract`(25/30/35) — shows
  multi-instance modules + nested penalties.
- **`nfl.ts`:** `capFormula`(fixed ~$255M) + `hardCap` + `salaryFloor`(89%) + `rosterLimits`(53) +
  `passThrough`("bonus proration/void-year dead money — input data in MVP").
- **`nhl.ts`:** `capFormula`(~$92M upper) + `hardCap` + `salaryFloor`(~$68M lower) +
  `maxContract`(20% of cap) + `passThrough`("LTIR — deferred").
- **`mls.ts`:** `capFormula`(salary budget) + `allocationPool`(GAM/TAM) + `maxContract` with a
  Designated-Player carve-out via `retainedRights`-style exemption — the allocation-money shape.
- **`nwsl.ts`:** `capFormula`(cap) + `allocationPool` + `minimumSalary` + `rosterLimits` — soft cap
  with allocation money, smaller numbers.
- **`pwhl.ts` ("hello world"):** `capFormula`(small hard team cap) + `hardCap` + `minimumSalary` +
  `rosterLimits` — the minimal preset proving the engine scales down.
- **`blank.ts`:** `modules: []` → cap sheet only, always legal — the invent-your-own starting point,
  the entry point for any custom/minor league (A-League, CFL, a beer league) at any dollar scale.

Numbers for the newer leagues (MLS/NWSL/PWHL) and any custom league can be approximate/illustrative
and flagged in a comment as "tune to your own figures" — the shapes and the *scale-independence* are
the point, not real-world accuracy.

## Cross-league remixing — the headline, and it falls out of the design

Because `evaluateRuleset(league, ruleset)` takes **any** roster with **any** ruleset, and a Ruleset is
just an editable ordered module list, remixing is free once the constructor exists:
- **Roster ⟂ Ruleset are fully decoupled** in the state model. One caveat to handle: **unit/scale
  normalization** (NBA $M vs PWHL small caps vs soccer wage bills). MVP approach: rosters and rulesets
  both use raw integer dollars; when a roster's scale mismatches a ruleset (e.g. NBA roster vs PWHL
  cap) that's *the interesting result* (everyone illegal), not a bug — surface it plainly.
- **Fork + graft UX:** `PresetRail` loads a preset Ruleset; `ModulePalette` adds any module;
  `RulesetBuilder` removes/reorders/toggles. Grafting "NBA's apron onto the NFL" = add one `apron`
  `ModuleInstance` to the NFL ruleset. First-class, obvious.
- **Ship 2 demo remixes** (as saved rulesets or a "Remixes" menu): (a) **NFL + a grafted 2nd apron**
  evaluated against an NFL roster; (b) **NBA roster under the NHL hard-cap ruleset** → nearly every
  team instantly illegal at ~$92M. These *are* the "wow."

## Repo scaffold (`/home/user/caponomics/`)

```
package.json  vite.config.ts  tsconfig.json  index.html   (+ existing LICENSE, README.md)
src/
  main.tsx  App.tsx
  engine/ types.ts  module.ts  catalog.ts  charges.ts  evaluate.ts  serialize.ts
          modules/{revenuePool,capFormula,hardCap,salaryFloor,luxuryTax,apron,maxContract,
                   minimumSalary,rosterLimits,draftPickPenalty,retainedRights,allocationPool,
                   passThrough,index}.ts
          __tests__/{evaluate,luxuryTax,serialize,presets}.test.ts
  presets/ index.ts  mlb2026.ts nba2026.ts nfl.ts nhl.ts mls.ts nwsl.ts pwhl.ts blank.ts
  data/    enums.ts  rosters/{mlb-sample,nba-sample,index}.ts
  ui/      theme.css  state/store.ts
           components/ AppShell.tsx  Toolbar.tsx
             sidebar/{PresetRail,ModulePalette}.tsx
             workspace/{RulesetBuilder,ModuleCard,ParamForm}.tsx
             compliance/{CompliancePanel,TeamPicker,MetricTiles,CapSheet,ComplianceSummary}.tsx
             primitives/{SegmentedControl,Slider,Switch,Chip,Badge,Accordion,MoneyInput}.tsx
```

- **deps:** `react`, `react-dom`, `zustand`, `@fontsource/inter` (self-hosted font), optional
  `@radix-ui/react-{accordion,slider,switch,toggle-group}` (accessible primitives). **devDeps:**
  `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, `@types/*`. Scripts:
  `dev/build/preview/test`.
- **vite.config.ts:** react plugin; `base: './'` (deploys under any static subpath); Vitest config
  folded in (`environment: 'jsdom'`, `globals: true`).
- **tsconfig:** `strict`, `moduleResolution: bundler`, `noUncheckedIndexedAccess` (guards
  `salaryByYear[year]`). `vite build` → static `dist/`.

## UI — a polished SaaS app shell (design brief locked)

**Design direction (explicit):** do **not** build a terminal / Bloomberg / engineering dashboard /
"AI tool" look. Target a modern, premium product — closer to **Linear, Raycast, Vercel, Stripe
Dashboard, Notion** than an analytics console. The app is about **designing systems**, not staring at
spreadsheets. It should feel like something someone would pay for: confident, calm, editorial,
information-dense without feeling dense. Interaction is **exploratory** — changing a parameter
immediately updates the compliance panel with subtle animation; users feel like they're *designing a
ruleset*, not filling out a government form.

**App-shell layout (three regions + sticky toolbar), cards not floating windows:**
- **Sticky top toolbar** — app name, active preset name + "forked" indicator, Save/Load/Export
  Ruleset, and a "Remixes" menu (the cross-league demos).
- **Left sidebar** — `PresetRail` (presets incl. Blank/custom) + `ModulePalette` (catalog grouped by
  category as chips/list rows → click to add). Collapsible.
- **Main workspace** — `RulesetBuilder`: the ordered stack of active modules as **editable cards**
  (`ModuleCard`), each an **accordion** exposing a **property inspector** (`ParamForm`). Reorder via
  drag; enable/disable via a **toggle**; remove inline. This is where you "build the system."
- **Right panel** — `CompliancePanel`: a `TeamPicker` (segmented control / pill list with legal status
  dots) + **summary metric tiles** (cap · team salary · tax owed · floor gap · apron distance) +
  `CapSheet` rendered as **grouped, expandable cards** (by player / charge type) with readable
  financial rows and inline indicators — **not** a giant spreadsheet grid; think Stripe Dashboard, not
  Excel + a `ComplianceSummary` (LEGAL/ILLEGAL pill badge + reason list + penalty chips by currency).

**Schema-driven property inspector:** `ParamForm` renders one control per `ParamField` via
`switch(field.type)` — sliders/steppers for `number`/`percent`, editable currency inputs for `money`,
`switch` toggles for `boolean`, **segmented controls** for `enum`, chip multi-select for `enumMulti`
(apron restrictions), and repeatable inspector rows for `bracketList` (tax/max tiers). **Key
decision:** invented modules become editable with **zero bespoke UI** — the schema generates the
inspector. Components lean on: segmented controls, pill badges, chips, accordions, sliders, toggles,
editable cards.

**State + reactivity:** `zustand` store `{ ruleset, league, selectedTeamId, report }`; any edit re-runs
the (fast, synchronous) engine → right panel updates **live** with a 150–250ms transition.

**Styling system (`src/ui/theme.css`, design tokens; no terminal aesthetic):**
- **Type:** modern sans-serif throughout — **Inter** (or Geist), self-hosted via `@fontsource` (no
  CDN, keeps the static bundle self-contained). **Monospace only** for currency values, JSON export,
  IDs, code — never as the primary UI face. Typography carries hierarchy; **borders are minimized** in
  favor of soft surfaces, elevation, and spacing.
- **Color:** brand/action accent **`#00B7E0`** (used sparingly, for primary actions/active state).
  Success = emerald, Warning = amber, Error = coral/red, Neutrals = slate grays. **No orange terminal
  accents.** A supporting palette for category chips / accents / light data viz: `#ff6b35`
  (atomic-tangerine), `#f7c59f` (peach-glow), `#efefd0` (beige), `#004e89` (steel-azure), `#1a659e`
  (baltic-blue).
- **Surfaces:** soft light surfaces (not harsh black), rounded corners **10–16px**, light shadows /
  subtle elevation, **8px spacing grid**, layered cards instead of bordered tables. Theme-aware (light
  default, optional dark) via CSS variables + `prefers-color-scheme`.
- **Approach:** plain CSS with a token layer (no Tailwind/MUI needed) + optional `@radix-ui/react-*`
  primitives (`accordion`, `slider`, `switch`, `toggle-group` for segmented controls) for accessible,
  well-behaved interactions, styled entirely with our own tokens. This keeps the bundle lean while
  hitting the polish bar.

## Build order

- **Phase 0 — Scaffold.** Vite+React+TS+Vitest; empty app builds, empty test suite runs.
- **Phase 1 — Engine skeleton + `capFormula`/`hardCap`/`salaryFloor`** + unit tests. *Gate: a
  hand-built ruleset flags an over-cap team.*
- **Phase 2 — Remaining MVP modules** (`luxuryTax` marginal brackets is the math-heavy one) +
  `serialize.ts` round-trip test. *Gate: full catalog green.*
- **Phase 3 — Presets + sample rosters.** MLB-2026 hero first, then NBA/NFL/NHL/MLS/NWSL/PWHL/blank;
  `presets.test.ts` acceptance. *Gate: MLB preset + Dodgers roster → illegal w/ exact tax; A's → floor
  violation.*
- **Phase 4 — UI, compliance panel first** (app shell + design tokens + right-panel result on the MLB
  preset before any editing), then the workspace `RulesetBuilder` + schema-driven property inspector,
  then the sidebar palette/preset rail.
- **Phase 5 — Share + remix demos + design polish.** Ruleset save/load (`.json` + URL hash), the 2
  remix demos ("Remixes" menu), and a design pass to the brief (spacing, elevation, transitions,
  light/dark).
- **Later (dev-site):** add a `projects/caponomics.html` card + detail page (auto-discovered by the
  standard.site sync) — trivial, do after the tool exists.

## Verification (prove it works end-to-end)

- **Engine unit tests (Vitest, the backbone):**
  - `luxuryTax`: $265M team under MLB brackets owes `20%×20M + 32%×5M = 5.6M` (assert exact integer);
    repeater adds surcharge.
  - `evaluate`: blank ruleset → cap sheet present + `legal=true`; hard-cap breach → `legal=false` w/
    one reason; floor shortfall → money penalty = exact gap.
  - `maxContract`+`retainedRights`: cornerstone over 16% max → illegal *unless* exemption enabled.
  - `serialize`: `deserialize(serialize(r))` deep-equals `r`; unknown `kind` dropped; missing params
    backfilled.
  - **`presets.test.ts` (headline acceptance):** MLB-2026 × mlb-sample → Dodgers illegal (over hard
    cap + top tax tier, tax matches), Yankees legal-in-tax, Athletics illegal (below floor); NBA sample
    crosses both aprons with correct `restrictions[]`.
  - **Remix test:** NBA sample × NHL ruleset → most teams `legal=false` at the ~$92M hard cap.
- **Build/run:** `npm run test` green; `npm run dev` serves both panels; `npm run build` + `preview`
  loads the static bundle.
- **Manual smoke:** load → MLB-2026 auto-selected → Dodgers ILLEGAL w/ tax readout → switch to A's →
  floor violation → drag luxury-tax threshold down in the workspace → readout updates live → add an
  `apron` module → new readout → Save → reload from file → identical report.

## Recommended simplifications (accepted for MVP)

1. **Cap hits are input data, not derived** — `salaryByYear` is the already-prorated number; this is
   what lets us defer `bonusProration`/`deadMoney`. Limits NFL/NHL realism (can't yet *compute* dead
   money from a cut) — that's the whole point of the deferred sandbox phase.
2. **Apron restrictions & draft-pick penalties are informational in MVP** (they restrict
   *transactions*, and there are none yet) — shown as active warnings/readouts, not hard `legal=false`,
   to avoid implying enforcement we don't have.
3. **RetainedRights is declarative** — models only the compliance-visible effect (exempt a player from
   the max), not full re-signing exception logic.
4. **Cap formulas are fixed/simple** — real BRI/HRR formulas deferred; `revenuePool`+`capFormula`
   thread through so upgrading is additive.
5. **Single-year compliance view** — types carry year-indexed series, but MVP UI shows one selected
   season year; multi-year projection deferred.

## Explicitly deferred to post-MVP

Live trade/transaction sandbox (`transform` + `Transaction`); side-by-side system comparison (diff two
`ComplianceReport`s); multi-year projection UI; all transaction modules (`tradeMatch`,
`bonusProration`, `deadMoney`, `buyout`, `salaryRetention`, `exception`, `rookieScale`, `tag`,
`injuryRelief`, escrow); rich roster editing; any backend/persistence/auth.
