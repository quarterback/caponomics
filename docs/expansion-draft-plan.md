# caponomics — Expansion Draft Models (design + build record)

> Status: **built** (first cut). Companion to `mvp-plan.md`. This documents the concept, the
> research grounding, and the as-built design of the second product surface — the **Expansion
> Draft** tab.

## The thesis (why it belongs here)

caponomics' whole spine is: *a system is a mix-and-match stack of small, string-keyed modules
applied to a decoupled roster.* An **expansion draft is the same shape.** It's not a cap system —
it's a **roster-redistribution system** — but it's built from the identical kind of reusable
primitives (protection schemes, exposure requirements, selection limits, rounds), and every
historical draft is *just a preset* of one composable kit — the same proof-of-generator argument
the cap side made.

## Scope (decided): a rules constructor, NOT a draft simulator

Per the user: **no "here is who would go where."** The tool does not resolve picks. What we want is
the *rulebook* — **catalog every expansion-draft variable, add our own, and let people pick and
match rules** with a fictional number of teams to add (1 or 2 at a time). Deliberately deferred:
any pick assignment/draft board, and roster *generation* for the expansion context (flagged as
probably too much work for the value). The loaded league is used only for roster-free quick math
(existing-team counts).

## Research: the variables of real drafts (recent-weighted)

Researched via sub-agent, weighted to 2021–2026: NHL Seattle 2021 (and Vegas 2017 — identical
rules; the divergence was behavioral side deals, not structure), WNBA Golden State 2024 and the
two-team Toronto/Portland 2026 draft, MLS San Diego 2024 (format unchanged since 2016), NBA
standing rules (last used Charlotte 2004), NFL Houston 2002, and the IPL retention/mega-auction as
a cross-sport cousin. Highlights that shaped the kit:

- **NHL 2021** — the modern reference: 7F/3D/1G *or* 8-skaters/1G protection choice; 1st/2nd-year
  pros + unsigned picks exempt; NMC must-protect; activity-tested exposure minimums (2F+1D signed
  with 40/70 games, 1G); exactly 1 pick per team; 30 picks landing 14F/9D/3G with 20+ signed;
  picks must total **60–100% of the cap**; a novel **pre-draft FA signing window** where a signing
  counts as the pick.
- **WNBA 2024 → 2026** — the trend line: protect 6 → protect 5; 2026 added a **per-team loss cap
  (2)** and **two alternating rounds from one shared pool** for the two new teams.
- **MLS (since 2016)** — protect 12; Generation Adidas/young Homegrown auto-protected; ≤5 picks,
  ≤1 per club with **elimination after a loss**; **$50k GAM compensation**; picks tradable and
  drafted salaries **unilaterally renegotiable**.
- **NBA (standing)** — protect 8; expose ≥1; ≤1 per team; 14–29 picks; UFAs untouchable; a drafted
  pending RFA **converts to UFA**; expansion cap ramp **66%/75%**.
- **NFL 2002** — protect 42; <3 accrued seasons exempt; list 5 eligible; ≤2 big-raise contracts in
  the pool; claim **30 players OR $27.2M** (dollar-or-count floor); **pull-backs** (1 name after a
  first loss, everyone after a second); no trading a pick back.
- **MLB 1997** — the multi-round ancestor: protect 15, three rounds, **+3 re-protections between
  rounds**, two teams alternating from a shared pool.
- **IPL (cousin)** — retention-before-auction: unused protection slots convert to right-to-match
  cards; a fixed purse replaces picking. Kept as inspiration, not a module (it's an auction, not a
  draft).

## As built

### The rule kit (21 modules, `src/engine/expansion/`)

Same catalog pattern as the cap engine — one small string-keyed def per rule, param schemas drive
auto-generated forms, and instead of an evaluate pipeline each rule **describes itself in plain
language**. Categories:

- **Protection** — `protectionScheme` (flat / positional slots / choice of A-or-B), `mustProtect`
  (movement clauses consume a slot).
- **Exemptions** — `youngPlayerExemption` (service-time + unsigned picks), `autoProtect`
  (described class, MLS-style), `injuryExemption`.
- **Exposure** — `exposureMinimums` (positional quotas + under-contract/games-played tests),
  `expensiveListingCap` (NFL's poison-pill limiter).
- **Selection** — `selectionQuota` (exactly/at-most N per team), `lossLimit` (+ MLS elimination),
  `pullback` (NFL), `rosterTargets` (size window, positional minimums, min under contract),
  `specialStatusRules` (UFA caps, off-limits classes, RFA→UFA conversions).
- **Rounds & order** — `rounds` (multi-round, re-protection between, alternating/snake/fixed),
  `multiTeamFormat` (shared pool vs sequential when 2+ teams join).
- **Money** — `financialWindow` (%-of-cap window or dollar-or-count floor), `compensation`,
  `expansionCapRamp`.
- **Special** — `preDraftWindow`, `sideDeals` (permitted/prohibited), `pickRights`
  (tradability / salary renegotiation / no-trade-back), `houseRule` (freeform escape hatch for
  your own ideas).

### Presets (`src/presets/expansion/`)

NHL 2021 Kraken · WNBA 2026 Toronto & Portland (two-team) · WNBA 2024 Golden State ·
MLS 2024 San Diego · NBA 2004 Charlotte · NFL 2002 Houston · MLB 1997 Arizona & Tampa Bay
(multi-round) — plus two caponomics originals proving mix-and-match: the **Hydra Protocol**
(2 teams, protect 4, 3 snake rounds with escalating re-protection) and the **Mercy Draft**
(protect 20, heavy compensation, no side deals) — and a blank canvas.

### UI

A top-level **Cap System ⇄ Expansion Draft** tab switch in the toolbar. The expansion tab mirrors
the cap layout: preset rail + rule palette on the left, the model builder in the middle (with a
model-level "new teams joining at once" count), and on the right the **rulebook** — the model
rendered as grouped plain-language rules plus roster-free "at a glance" stats (protected per team,
picks per team, rounds, a loss-limit-aware upper bound on selections). Models serialize to JSON and
share-links (`#x=`) exactly like rulesets (`#r=`); Save/Import/Copy-link in the toolbar follow the
active tab. The `ModuleCard` was genericized so both tabs share one card/param-form implementation.

### Future (unbuilt, compatible)

- Applying a model to the loaded roster for per-team protected-vs-exposed **counts** (still no
  picks) — cheap because the tab already shares the cap side's league data.
- A manual draft board with live rule enforcement — the "someday" tier, explicitly not wanted yet.
