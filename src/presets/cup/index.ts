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

const blankCup = model('cup-blank', 'Blank cup', 'any', [])

export const CUP_PRESETS: CupModel[] = [nbaCup, mlbCup, nhlCup, blankCup]
export const CUP_PRESET_MAP: Record<string, CupModel> = Object.fromEntries(CUP_PRESETS.map((p) => [p.id, p]))
export const DEFAULT_CUP_PRESET_ID = 'cup-nba-2026'

/** The league each preset was written for, so its team count is right when loaded. */
export const CUP_PRESET_LEAGUE: Record<string, string> = {
  'cup-nba-2026': 'nba-sample',
  'cup-mlb': 'mlb-sample',
  'cup-nhl': 'nhl-league',
}
