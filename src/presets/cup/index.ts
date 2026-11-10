// Cup format presets. The NBA Cup is the format as played; the MLB and NHL
// cups are invented here to show what has to change for each sport.

import { CUP_MAP } from '../../engine/cup/catalog'
import type { CupModel } from '../../engine/cup/types'
import type { ModuleInstance } from '../../engine/types'

let counter = 0

function c(kind: string, params: Record<string, unknown> = {}): ModuleInstance {
  const def = CUP_MAP[kind]
  const base = def ? (structuredClone(def.defaultParams) as Record<string, unknown>) : {}
  return { id: `${kind}-${++counter}`, kind, enabled: true, params: { ...base, ...params } }
}

const model = (id: string, name: string, sport: string, modules: ModuleInstance[], notes?: string): CupModel => ({
  schemaVersion: 1,
  id,
  name,
  sport,
  currency: 'USD',
  modules,
  meta: notes ? { notes } : undefined,
})

// ─── NBA Cup, as played in 2026 ──────────────────────────────────────────────
// Six groups of five inside each conference; one game against each group
// opponent; six group winners and one wild card from each conference advance.
// Quarterfinals at the higher seed, semifinals and final at a neutral site.
// Every game counts in the standings except the final. Prize figures are the
// reported 2025 per-player amounts; the 2026 amounts were not published when
// this preset was written, and no runner-up figure was confirmed.
const nbaCup = model(
  'cup-nba-2026',
  'NBA Cup',
  'basketball',
  [
    c('cupField', { mode: 'all' }),
    c('groupStage', { groups: 6, bound: 'conference', draw: 'pots', meetings: 1, seriesLength: 1 }),
    c('standings', { system: 'wins' }),
    c('tiebreakers', { steps: ['headToHead', 'differential', 'scored', 'priorRecord', 'random'], excludeOvertime: true }),
    c('advancement', { perGroup: 1, wildCards: 2, wildScope: 'conference' }),
    c('knockout', { earlyFormat: 'single', earlySite: 'higherSeed', semiFormat: 'single', finalFormat: 'single', lateSite: 'neutral' }),
    c('seasonCount', { group: true, knockout: true, final: false }),
    c('prizeMoney', { firstRound: 53093, semifinal: 106187, runnerUp: 0, champion: 530933, countsOnCap: false }),
  ],
  'Format as played in 2026. Prize amounts are the reported 2025 figures.',
)

// ─── MLB Cup (invented) ──────────────────────────────────────────────────────
// Baseball plays series, so a group "meeting" is a three-game series and a
// group ranks teams by series won. The six existing divisions are the groups,
// which keeps every group series inside the normal schedule.
const mlbCup = model(
  'cup-mlb',
  'MLB Cup (invented)',
  'baseball',
  [
    c('cupField', { mode: 'all' }),
    c('groupStage', { groups: 6, bound: 'division', draw: 'fixed', meetings: 1, seriesLength: 3 }),
    c('standings', { system: 'series' }),
    c('tiebreakers', { steps: ['headToHead', 'differential', 'priorRecord', 'random'], excludeOvertime: false }),
    c('advancement', { perGroup: 1, wildCards: 2, wildScope: 'conference' }),
    c('knockout', { earlyFormat: 'bestOf3', earlySite: 'higherSeed', semiFormat: 'bestOf3', finalFormat: 'single', lateSite: 'neutral' }),
    c('seasonCount', { group: true, knockout: false, final: false }),
    c('prizeMoney', { firstRound: 50000, semifinal: 100000, runnerUp: 200000, champion: 500000, countsOnCap: false }),
    c('winnerReward', { type: 'seeding' }),
  ],
  'Invented for this tool. MLB has no cup.',
)

// ─── NHL Cup (invented) ──────────────────────────────────────────────────────
// Hockey has overtime losses, so groups rank by points. Eight groups of four
// give every team a home and an away game against each group opponent, and
// eight group winners fill the bracket with no wild cards.
const nhlCup = model(
  'cup-nhl',
  'NHL Cup (invented)',
  'hockey',
  [
    c('cupField', { mode: 'all' }),
    c('groupStage', { groups: 8, bound: 'conference', draw: 'pots', meetings: 2, seriesLength: 1 }),
    c('standings', { system: 'points321' }),
    c('tiebreakers', { steps: ['headToHead', 'differential', 'scored', 'priorRecord', 'random'], excludeOvertime: true }),
    c('advancement', { perGroup: 1, wildCards: 0, wildScope: 'conference' }),
    c('knockout', { earlyFormat: 'single', earlySite: 'higherSeed', semiFormat: 'single', finalFormat: 'single', lateSite: 'neutral' }),
    c('seasonCount', { group: true, knockout: true, final: false }),
    c('prizeMoney', { firstRound: 25000, semifinal: 50000, runnerUp: 100000, champion: 250000, countsOnCap: false }),
  ],
  'Invented for this tool. The NHL has no cup.',
)

// ─── MLS in-season cup (invented) ────────────────────────────────────────────
// The NBA Cup shape with soccer scoring: draws are possible, so groups rank by
// points. Group games are league games, so the cup adds only the final.
const mlsCup = model(
  'cup-mls',
  'MLS in-season cup (invented)',
  'soccer',
  [
    c('cupField', { mode: 'all' }),
    c('groupStage', { groups: 6, bound: 'conference', draw: 'pots', meetings: 1, seriesLength: 1 }),
    c('standings', { system: 'points310' }),
    c('tiebreakers', { steps: ['headToHead', 'differential', 'scored', 'priorRecord', 'random'], excludeOvertime: false }),
    c('advancement', { perGroup: 1, wildCards: 2, wildScope: 'conference' }),
    c('knockout', { earlyFormat: 'single', earlySite: 'higherSeed', semiFormat: 'single', finalFormat: 'single', lateSite: 'higherSeed' }),
    c('seasonCount', { group: true, knockout: true, final: false }),
    c('winnerReward', { type: 'continental', places: 1, competition: 'Concacaf Champions Cup' }),
  ],
  'Invented for this tool. MLS clubs already play the Leagues Cup and the U.S. Open Cup.',
)

// ─── NWSL in-season cup (invented) ───────────────────────────────────────────
const nwslCup = model(
  'cup-nwsl',
  'NWSL in-season cup (invented)',
  'soccer',
  [
    c('cupField', { mode: 'all' }),
    c('groupStage', { groups: 4, bound: 'league', draw: 'pots', meetings: 1, seriesLength: 1 }),
    c('standings', { system: 'points310' }),
    c('tiebreakers', { steps: ['headToHead', 'differential', 'scored', 'random'], excludeOvertime: false }),
    c('advancement', { perGroup: 2, wildCards: 0, wildScope: 'league' }),
    c('knockout', { earlyFormat: 'single', earlySite: 'higherSeed', semiFormat: 'single', finalFormat: 'single', lateSite: 'neutral' }),
    c('seasonCount', { group: false, knockout: false, final: false }),
    c('prizeMoney', { firstRound: 0, semifinal: 5000, runnerUp: 10000, champion: 25000, countsOnCap: false }),
  ],
  'Invented for this tool. Prize amounts are placeholders.',
)

// ─── Leagues Cup, as played in 2026 ──────────────────────────────────────────
// 36 clubs: all 18 Liga MX clubs and the 18 MLS clubs that reached the 2025
// MLS Cup playoffs. Three matches each against clubs from the other league,
// one table per league, top four of each table to the quarterfinals. No draws:
// a level match goes to a shootout. The top three qualify for the Champions Cup.
const leaguesCup = model(
  'cup-leagues-2026',
  'Leagues Cup',
  'soccer',
  [
    c('cupField', {
      mode: 'open',
      count: 36,
      qualify: 'all 18 Liga MX clubs, and the 18 MLS clubs that reached the previous MLS Cup playoffs',
    }),
    c('leaguePhase', { matches: 3, opponents: 'otherLeague', tables: 'perLeague' }),
    c('standings', { system: 'points3shootout' }),
    c('advancement', { perGroup: 4, wildCards: 0, wildScope: 'league' }),
    c('knockout', { earlyFormat: 'single', earlySite: 'host', semiFormat: 'single', finalFormat: 'single', lateSite: 'host', thirdPlace: true }),
    c('seasonCount', { group: false, knockout: false, final: false }),
    c('winnerReward', { type: 'continental', places: 3, competition: 'Concacaf Champions Cup' }),
  ],
  'Format as played in 2026.',
)

// ─── Concacaf Champions Cup, as played in 2026 ───────────────────────────────
// 27 clubs, knockout from the start. Five clubs skip Round One. Every round
// is two legs except the final.
const championsCup = model(
  'cup-concacaf-2026',
  'Concacaf Champions Cup',
  'soccer',
  [
    c('cupField', {
      mode: 'open',
      count: 27,
      qualify: 'through MLS, Liga MX, the Canadian Premier League, the Canadian Championship, the Leagues Cup, the Central American Cup and the Caribbean Cup',
    }),
    c('knockout', {
      earlyFormat: 'twoLegs',
      semiFormat: 'twoLegs',
      finalFormat: 'single',
      lateSite: 'host',
      byes: 5,
      byeFor: 'the champions of the Caribbean Cup, the Central American Cup, the Leagues Cup and MLS Cup, and the Liga MX champion with the better record',
    }),
    c('seasonCount', { group: false, knockout: false, final: false }),
  ],
  'Format as played in 2026.',
)

// ─── Concacaf in three tiers (invented) ──────────────────────────────────────
// The European shape applied to the whole confederation. Every one of the 41
// member associations sends at least one club, so the lower competitions are
// where most associations play. Stronger associations get more places and
// places higher up. The top competition is a 24-club league phase.
const concacafTiers = model(
  'cup-concacaf-tiers',
  'Concacaf in three tiers (invented)',
  'soccer',
  [
    c('coefficientRule', {}),
    c('associationPlaces', {}),
    c('leaguePhase', { matches: 6, opponents: 'drawn', tables: 'one' }),
    c('standings', { system: 'points310' }),
    c('tiebreakers', { steps: ['differential', 'scored', 'random'], excludeOvertime: false }),
    c('advancement', { perGroup: 8, wildCards: 0, wildScope: 'league' }),
    c('knockout', { earlyFormat: 'twoLegs', semiFormat: 'twoLegs', finalFormat: 'single', lateSite: 'neutral' }),
    c('tiers', { count: 2, size: 0, names: 'Champions Cup, Shield, Conference Cup', dropDown: true, promote: true }),
    c('seasonCount', { group: false, knockout: false, final: false }),
  ],
  'Invented for this tool. The coefficients are placeholders that set a starting order. They are not Concacaf’s ranking. Edit them and the places for each ranking band.',
)

const blankCup = model('cup-blank', 'Blank cup', 'any', [])

export const CUP_PRESETS: CupModel[] = [nbaCup, mlbCup, nhlCup, mlsCup, nwslCup, leaguesCup, championsCup, concacafTiers, blankCup]
export const CUP_PRESET_MAP: Record<string, CupModel> = Object.fromEntries(CUP_PRESETS.map((p) => [p.id, p]))
export const DEFAULT_CUP_PRESET_ID = 'cup-nba-2026'

/** The league each preset was written for, so its team count is right when loaded. */
export const CUP_PRESET_LEAGUE: Record<string, string> = {
  'cup-nba-2026': 'nba-sample',
  'cup-mlb': 'mlb-sample',
  'cup-nhl': 'nhl-league',
  'cup-mls': 'mls-league',
  'cup-nwsl': 'nwsl-league',
  'cup-leagues-2026': 'mls-league',
  'cup-concacaf-2026': 'mls-league',
  'cup-concacaf-tiers': 'mls-league',
}
