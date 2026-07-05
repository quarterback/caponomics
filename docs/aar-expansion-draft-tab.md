# After-Action Report — Expansion Draft tab: a rules constructor for expansion drafts

**Date completed:** 2026-07-05
**Branch:** `claude/expansion-draft-models-1v97pc` (PR #6)
**Commits (in order):**
- `1aa71c3` — Add Expansion Draft tab: mix-and-match expansion-draft rules constructor
- `0a56160` — Add historical presets and side-by-side model comparison

Picks up where `aar-league-scale-and-currency.md` left off. This run added the second
product surface to caponomics: alongside "design a cap system," you can now "design an
expansion draft." Full design record in `docs/expansion-draft-plan.md`.

---

## What was asked for

The brief arrived, as usual, as thinking-out-loud, and sharpened over three exchanges:

1. **The concept:** *"explore expansion draft models since they feel like a solid add-on to
   this, they'd be in a different tab… but conceptually the same — looking at various
   historical and current expansion draft models and devising different ones you can mix and
   match with a fictional number of teams to add to a league from 1 or 2 at a time."*
2. **The scope cut (the important one):** *"you'd need a sub agent to go look at the various
   expansion drafts, more from recent years than older ones… i don't think i'd want to bother
   yet with actual 'here is who would go where' type style — what we want is just all of the
   variables, and add our own ideas, and then let people pick and match rules."* Roster
   generation for the expansion context was explicitly flagged as probably too much work.
   **A rules constructor, not a draft simulator.**
3. **The preset roster, via conversation:** riffing on Vegas 2017 being the best draft ever
   for a team (identical rules to Seattle — the divergence was the side-deal layer, which is
   why `sideDeals` is a module), the user judged most old drafts awful but *"arguably the 90s
   MLB ones and the last NBA early expansion drafts worth comparing… nfl 02 and charlotte 04
   worth adding, too. so yes add them all."* That both named the missing presets and confirmed
   the side-by-side comparison view.

---

## What shipped

### 1. A research pass before any code (sub-agent)

A sub-agent extracted the *rulebook mechanics* (not the pick lists) of every draft, weighted
recent: NHL Seattle 2021/Vegas 2017, WNBA 2024 and the two-team 2026 draft, MLS San Diego
2024, NBA standing rules, NFL Houston 2002, MLB 1992/1997, and the IPL retention-auction as a
cousin. Its key deliverable — the union of every distinct rule-knob across leagues — became
the module catalog almost 1:1. The digest lives in `docs/expansion-draft-plan.md`.

### 2. A pure expansion engine (`src/engine/expansion/`) — `1aa71c3`

Same catalog architecture as the cap engine: 21 string-keyed rule modules across seven
categories (protection, exemptions, exposure, selection, rounds, financial, special), each a
small def with a param schema that drives the auto-generated forms. The deliberate difference:
**there is no evaluate pipeline.** Instead of computing compliance, each rule `describe()`s
itself, and `summarizeModel()` renders the whole model as a category-grouped plain-language
**rulebook** plus roster-free "at a glance" stats. An `ExpansionModel` is plain JSON with a
model-level `teamsAdded`, serialized/shared via `#x=` hash links parallel to rulesets' `#r=`,
with the same defensive deserializer (unknown kinds dropped, params coerced).

### 3. Historical models as presets (`src/presets/expansion/`) — both commits

Thirteen presets: the modern reference models (NHL 2021 choice-scheme protection with
activity-tested exposure and a 60–100%-of-cap window; WNBA 2026's two-team shared-pool
alternating rounds), the old ones kept for their signature mechanics (NFL 2002's
dollar-or-count floor and pull-backs; MLB 1992/1997's multi-round re-protection accordion;
NBA 1995's shared pool vs. the 1988–89 wave's staggered sequential drafts; NBA 2004's
standing rules), two caponomics originals proving mix-and-match (Hydra Protocol, Mercy
Draft), and a blank canvas.

### 4. The tab (`src/ui/`) — `1aa71c3`

A **Cap System ⇄ Expansion Draft** switch in the toolbar; Save/Import/Copy-link follow the
active tab. The expansion tab mirrors the cap layout: preset rail + rule palette, model
builder (with the teams-added dial), rulebook panel. `ModuleCard` was genericized (def +
actions via props) so both tabs share one card/param-form implementation. The loaded league
is shared state, used only for quick math (existing-team counts).

### 5. Side-by-side comparison — `0a56160`

A "Compare with…" selector renders any preset's rulebook next to the working model. Built for
the old-vs-new contrast the user wanted: put MLB 1992 beside NHL 2021 and the absence of
exposure-quality tests and financial windows *is* the story of why old drafts were awful.

## Validation

- 37 tests pass (10 new): catalog integrity (unique kinds, schema/default consistency,
  every rule describes itself), preset round-trips, hash encode/decode, deserializer
  defenses (unknown kinds dropped, bad params coerced, `teamsAdded` clamped), and
  signature-mechanic assertions per preset (Kraken's "11 or 9", WNBA 2026's shared pool,
  MLB's re-protection accordion, NBA 1988–89's sequential format).
- `tsc` clean; production build clean; both tabs exercised in a real browser (Playwright
  screenshots) with zero console errors — cap tab verified unregressed.

## What I did NOT do (be clear about the edges)

- **No pick resolution of any kind** — by explicit instruction. No draft board, no
  auto-draft, no "who goes where." The rulebook is the output.
- **No roster application** — protected-vs-exposed counts against the loaded roster would be
  cheap (the tab already shares league data) but was deferred as unrequested.
- **Old-draft params are template-faithful, not archival.** MLB 1992/1997 and NBA 1988–95
  encode the documented core template (protect 15, +3 per round, etc.); fine-print I couldn't
  verify (e.g. per-round loss quirks in '92) lives in honest `houseRule` notes rather than
  invented parameters.
- **Expansion models are USD-only** — the ruleset currency selector wasn't extended to
  models; money knobs (e.g. the NFL dollar floor) display in USD.

## Decisions & trade-offs worth remembering

- **Describe, don't evaluate.** Dropping the evaluate phase made the whole surface cheap and
  honest: modules render sentences, not verdicts. If roster application lands later, a
  `check()` hook can be added per module without touching the catalog shape.
- **Vegas ≡ Seattle as presets.** The 2017/2021 rules are identical, so there's one NHL
  preset; the Vegas story is carried by the `sideDeals` module (permitted/prohibited is
  itself a rule choice). Rules alone don't determine outcomes — on-brand for "a calculator,
  not a prescription."
- **`teamsAdded` is model-level, not a module** — it's the one thing every rule reads
  (`multiTeamFormat` only bites at 2+), like `currency` on rulesets.
- **Quick math prefers stated rules over arithmetic.** The selections stat uses an explicit
  roster-target when present and falls back to quota × rounds bounded by the loss-limit pool
  only when the model doesn't say.
- **`houseRule` is the escape hatch** for "add our own ideas" — freeform plain-language rules
  compose with the structured ones in the rulebook.

## Next steps (unprioritized)

- Protected-vs-exposed counts per team against the loaded roster (still no picks).
- Extend the currency selector to expansion models.
- Compare view: diff-highlighting (which categories one model has and the other lacks).
- The someday tier: a manual draft board with live rule enforcement — explicitly not wanted
  yet.
