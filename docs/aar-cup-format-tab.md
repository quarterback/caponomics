# After-Action Report — Cup Format tab

**Date completed:** 2026-11-10
**Branch:** `claude/peaceful-faraday-35fzk2`

Continues `aar-design-refresh.md`.

---

## What was asked for

*"can we add a NBA Cup modifier? it would be interesting to amend the format and maybe add one to
MLB, NHL (not the NFL)."* Ron asked for feasibility first. The answer was that a cup cannot be a
cap mechanic, because the tool holds rosters and payrolls but no conferences, schedules or results.
Two shapes were offered. Ron chose the first: *"yes, the cup format constructor is what i was
asking for."*

---

## What shipped

A third tab, **Cup Format**, built the same way as the Expansion Draft tab: a stack of rule
modules, a rulebook written in sentences, and a side-by-side comparison with any preset. It plays
no games.

### Engine (`src/engine/cup/`)
Ten rules in seven groups:

| Group | Rules |
| --- | --- |
| Teams | Teams entered |
| Group stage | Group stage, Group standings, Tiebreakers |
| Advancing | Who advances |
| Knockout rounds | Knockout rounds |
| Schedule | Regular-season record |
| Prizes | Prize money, Reward for the champion |
| Other rules | Your own rule |

`cupNumbers()` does the arithmetic that needs only a team count: group sizes, group games for
each team, how many teams advance, knockout rounds, and the most games the cup can add to one
team's season.

### Presets (`src/presets/cup/`)
- **NBA Cup** — the format as played in 2026: six groups of five inside each conference, one game
  against each group opponent, six group winners and one wild card from each conference, the
  final not counted in the standings.
- **MLB Cup (invented)** — the six divisions are the groups, each meeting is a three-game series,
  and groups rank teams by series won. Knockout rounds are extra games.
- **NHL Cup (invented)** — eight groups of four, home and away, ranked by points with 3 for a
  regulation win. Eight group winners advance and there are no wild cards.
- **Blank cup.**

Loading a preset also loads its league, so the team count matches.

### Screens
`CupRail`, `CupBuilder` and `CupSummary` under `src/ui/components/cup/`. The builder reuses the
existing module card and parameter form. Save, Import and Copy link work on the tab; a shared
link uses `#c=`.

The cap side of a cup is covered by two rules: prize money can be set to count against the salary
cap, and the champion's reward can be extra cap room or a luxury tax reduction. These are written
into the rulebook only. They do not feed the Cap System tab's compliance check.

---

## Validation

- 9 new engine tests; the full suite is 73 tests and passes. Typecheck and build are clean.
- NBA Cup on 30 teams gives 6 groups of 5, 4 group games, 8 teams advancing, 3 knockout rounds and
  1 added game, which matches the published format.
- Checked in a headless browser at 1500px and 390px: all three presets, the comparison view, no
  console errors, no horizontal page scroll.

---

## Sources and what is uncertain

- The NBA Cup format (groups, wild cards, tiebreaker order, overtime scoring excluded, which games
  count) was checked against 2026 coverage from NBA.com, ESPN and Sports Illustrated.
- **Prize money is the reported 2025 amount** per player: $53,093 for losing a quarterfinal,
  $106,187 for losing a semifinal, $530,933 for the champion. The 2026 amounts had not been
  published. No runner-up figure was confirmed, so the preset leaves it at zero and the rulebook
  omits it.
- The MLB and NHL cups are invented. Their prize amounts are placeholders.

---

## What this does not do

- It cannot say who would advance or win. That needs schedules and results.
- It assumes two conferences when it splits wild cards "evenly between the conferences".
- It does not check that a format fits a league. Eight groups in a 30-team league produce groups
  of 3 or 4, and the tool reports that without objecting.
- Cup prize and reward rules are not connected to the cap compliance engine.
- No NFL preset, as requested.
