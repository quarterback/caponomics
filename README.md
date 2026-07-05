# caponomics

**Salary Cap Imagineering** — a sport-agnostic salary-cap *system constructor* and compliance
checker. Think "the NBA Trade Machine, but for cap-*system construction*." Compose a cap system out
of reusable mechanic modules (hard cap, aprons, luxury tax, floor, max-contract rules, exceptions,
revenue→cap formula…), load any roster, and see the cap sheet + whether it's legal and what
penalties apply.

Because roster data and rulesets are fully decoupled, you can **mix and match across leagues** —
*"What would a second apron look like in the NFL? What if NBA teams had to use the hockey cap?"* —
and instantly find out.

> It's a **calculator, not a prescription.** It computes the *consequences* of whatever rules you
> invent and passes no judgment on whether a cap design is good or fair. Financials are arbitrary —
> set the cap to $40 if you want. A minor league, the A-League, the CFL, a fantasy league — any
> scale works.

## Run it

```bash
npm install
npm run dev        # dev server (Vite)
npm run build      # static build → dist/
npm run preview    # serve the built app
npm test           # engine unit tests (Vitest)
```

Fully client-side (React + TypeScript + Vite). No backend — all cap math runs in the browser and it
deploys as a static site.

## Deploy (Vercel / Netlify)

It's a static SPA, so hosting is zero-infrastructure. Config for both platforms is committed:

- **Vercel** — Import the repo at [vercel.com/new](https://vercel.com/new). `vercel.json` sets the
  Vite framework preset, `npm run build`, `dist/` output, and SPA fallback. Nothing to configure.
- **Netlify** — "Add new site → Import an existing project" at
  [app.netlify.com](https://app.netlify.com/start). `netlify.toml` sets the build command, publish
  dir, Node version, and SPA redirect.

Either platform auto-builds on every push to the branch. The build is portable (relative asset
paths via `base: './'`), so it also works from a GitHub Pages project subpath if you'd rather host
there.

## How it's built

The extensibility spine is a flat catalog of small **mechanic modules**, each keyed by a string
`kind`. Inventing a mechanic = add one module + one catalog entry.

- `src/engine/` — the pure, framework-free engine. `evaluateRuleset(league, ruleset) →
  ComplianceReport`, run per team/year in three phases (environment → charge → validate).
  - `module.ts` — the `CapModuleDef` interface + param schema (drives auto-generated forms).
  - `catalog.ts` — `MODULE_CATALOG` / `MODULE_MAP` registry.
  - `modules/` — one file per mechanic (`hardCap`, `luxuryTax`, `apron`, `maxContract`, …).
  - `serialize.ts` — rulesets are plain JSON (save / load / share via URL hash).
- `src/presets/` — the four majors plus MLS/NWSL/PWHL and a blank, each a `Ruleset` literal. The
  fact that real leagues are *just presets* is the proof the generator is real.
- `src/data/rosters/` — sample rosters (decoupled from rulesets; any roster runs against any system).
- `src/ui/` — the React app shell (sidebar palette · workspace ruleset builder · compliance panel).

There's also a second surface built on the same spine: the **Expansion Draft** tab
(`src/engine/expansion/`), a rules *constructor* for expansion-draft models. Compose protection
schemes, exemptions, exposure minimums, selection limits, rounds, and financial windows from the
same kind of mix-and-match modules; load historical presets (NHL 2021, WNBA 2026 two-team, MLS,
NBA 1988–2004, NFL 2002, MLB 1992/1997) or invent your own. It renders the model as a
plain-language rulebook — with side-by-side comparison against any preset — and deliberately
runs no "who would get picked" simulation. See `docs/expansion-draft-plan.md`.

## Status

MVP: **construct a cap system + check roster compliance**, plus the expansion-draft rules
constructor. A live trade/transaction sandbox, side-by-side system comparison, and the
transaction-derived modules (proration/dead money, buyouts, retention, exceptions) are
designed-for but deferred. See `docs/mvp-plan.md`.
