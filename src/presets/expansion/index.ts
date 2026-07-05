// Expansion-draft model presets — the historical drafts, weighted to recent
// ones, each expressed as a stack of the same mix-and-match rule modules a
// user can build from scratch. That they're *just presets* is the proof the
// constructor is real (same argument as the cap presets).

import { EXPANSION_MAP } from '../../engine/expansion/catalog'
import type { ExpansionModel } from '../../engine/expansion/types'
import type { ModuleInstance } from '../../engine/types'

let counter = 0

/** Build a rule instance, backfilling unspecified params from defaults. */
function x(kind: string, params: Record<string, unknown> = {}): ModuleInstance {
  const def = EXPANSION_MAP[kind]
  const base = def ? (structuredClone(def.defaultParams) as Record<string, unknown>) : {}
  return { id: `${kind}-${++counter}`, kind, enabled: true, params: { ...base, ...params } }
}

function model(id: string, name: string, sport: string, teamsAdded: number, modules: ModuleInstance[]): ExpansionModel {
  return { schemaVersion: 1, id, name, sport, currency: 'USD', teamsAdded, modules }
}

// ─── NHL 2021 — Seattle Kraken (rules identical to Vegas 2017) ───────────────
// The modern reference model: positional protection choice, activity-tested
// exposure, a cap-percentage window, and the novel pre-draft FA window. The
// Vegas/Seattle divergence was behavioral (side deals), not structural.
const nhlKraken = model('exp-nhl-2021', 'NHL 2021 — Seattle Kraken', 'hockey', 1, [
  x('protectionScheme', { mode: 'choice' }),
  x('mustProtect', {}),
  x('youngPlayerExemption', { maxYears: 2, unsignedPicks: true }),
  x('injuryExemption', { gamesMissed: 60 }),
  x('exposureMinimums', {}),
  x('selectionQuota', { perTeam: 'exactly', count: 1 }),
  x('rosterTargets', {
    minSize: 30,
    maxSize: 30,
    positionalMins: [
      { pos: 'F', count: 14 },
      { pos: 'D', count: 9 },
      { pos: 'G', count: 3 },
    ],
    minUnderContract: 20,
  }),
  x('financialWindow', { mode: 'pctWindow', floorPct: 60, ceilingPct: 100 }),
  x('preDraftWindow', { days: 3, countsAsPick: true, maxPerTeam: 1 }),
  x('sideDeals', { allowed: true }),
])

// ─── WNBA 2024 — Golden State Valkyries ──────────────────────────────────────
const wnba2024 = model('exp-wnba-2024', 'WNBA 2024 — Golden State', 'basketball', 1, [
  x('protectionScheme', { mode: 'flat', flatCount: 6 }),
  x('selectionQuota', { perTeam: 'exactly', count: 1 }),
  x('specialStatusRules', {
    maxSpecial: 1,
    cappedStatus: 'pending unrestricted free agent',
    offLimits: 'players who have been on a Core contract for 2+ seasons',
  }),
])

// ─── WNBA 2026 — Toronto Tempo & Portland Fire ───────────────────────────────
// The two-team template: tighter protection, a per-team loss cap, and two
// alternating rounds from one shared pool.
const wnba2026 = model('exp-wnba-2026', 'WNBA 2026 — Toronto & Portland', 'basketball', 2, [
  x('protectionScheme', { mode: 'flat', flatCount: 5 }),
  x('selectionQuota', { perTeam: 'atMost', count: 1 }),
  x('lossLimit', { maxLost: 2 }),
  x('rounds', { count: 2, order: 'alternating' }),
  x('multiTeamFormat', { pool: 'shared', firstPickRotates: true }),
  x('specialStatusRules', { maxSpecial: 1, cappedStatus: 'pending unrestricted free agent' }),
])

// ─── NBA — standing rules (last used: Charlotte, 2004) ───────────────────────
const nba2004 = model('exp-nba-2004', 'NBA 2004 — Charlotte', 'basketball', 1, [
  x('protectionScheme', { mode: 'flat', flatCount: 8 }),
  x('exposureMinimums', { quotas: [{ pos: 'player', count: 1 }], underContract: false, minGames: 0, minGamesTwoSeasons: 0 }),
  x('selectionQuota', { perTeam: 'atMost', count: 1 }),
  x('rosterTargets', { minSize: 14, maxSize: 29 }),
  x('specialStatusRules', {
    maxSpecial: 0,
    offLimits: 'unrestricted free agents (they can be neither protected nor selected)',
    conversion: 'a selected pending restricted free agent immediately becomes unrestricted',
  }),
  x('expansionCapRamp', { year1Pct: 66, year2Pct: 75 }),
])

// ─── NFL 2002 — Houston Texans ───────────────────────────────────────────────
const nfl2002 = model('exp-nfl-2002', 'NFL 2002 — Houston', 'football', 1, [
  x('protectionScheme', { mode: 'flat', flatCount: 42 }),
  x('youngPlayerExemption', { maxYears: 2, unsignedPicks: false }),
  x('exposureMinimums', { quotas: [{ pos: 'eligible player', count: 5 }], underContract: false, minGames: 0, minGamesTwoSeasons: 0 }),
  x('expensiveListingCap', { maxCount: 2, raisePct: 75 }),
  x('financialWindow', { mode: 'dollarOrCount', countFloor: 30, dollarFloor: 27_200_000 }),
  x('pullback', { afterFirst: 1, allAfterSecond: true }),
  x('pickRights', { tradable: true, renegotiation: false, noTradeBack: true }),
  x('houseRule', {
    title: 'Pool exclusions',
    note: 'No kickers or punters; no pending unrestricted or restricted free agents; no players who went on IR during training camp.',
  }),
])

// ─── MLS — modern format (San Diego 2024; unchanged since 2016) ──────────────
const mls2024 = model('exp-mls-2024', 'MLS 2024 — San Diego', 'soccer', 1, [
  x('protectionScheme', { mode: 'flat', flatCount: 12 }),
  x('autoProtect', { criteria: 'Generation Adidas players and Homegrown players aged 25 or younger', consumesSlot: false }),
  x('selectionQuota', { perTeam: 'atMost', count: 1 }),
  x('rosterTargets', { minSize: 0, maxSize: 5 }),
  x('lossLimit', { maxLost: 1, elimination: true }),
  x('compensation', { amount: 50_000, unit: 'general allocation money' }),
  x('pickRights', { tradable: true, renegotiation: true, noTradeBack: false }),
])

// ─── MLB 1997 — Arizona & Tampa Bay ──────────────────────────────────────────
// The multi-round ancestor: two teams, three rounds, re-protection between.
const mlb1997 = model('exp-mlb-1997', 'MLB 1997 — Arizona & Tampa Bay', 'baseball', 2, [
  x('protectionScheme', { mode: 'flat', flatCount: 15 }),
  x('youngPlayerExemption', { maxYears: 2, unsignedPicks: true }),
  x('selectionQuota', { perTeam: 'atMost', count: 1 }),
  x('rounds', { count: 3, reProtect: 3, order: 'alternating' }),
  x('multiTeamFormat', { pool: 'shared', firstPickRotates: true }),
])

// ─── caponomics originals — proof of mix-and-match ───────────────────────────
// The Hydra Protocol: an invented maximal-chaos model. Two teams, thin
// protection, a snake draft with escalating re-protection, and compensation
// that makes losing players survivable.
const hydra = model('exp-hydra', 'Hydra Protocol — caponomics original', 'any', 2, [
  x('protectionScheme', { mode: 'flat', flatCount: 4 }),
  x('exposureMinimums', { quotas: [{ pos: 'starter', count: 2 }], underContract: true, minGames: 0, minGamesTwoSeasons: 0 }),
  x('selectionQuota', { perTeam: 'atMost', count: 1 }),
  x('lossLimit', { maxLost: 3 }),
  x('rounds', { count: 3, reProtect: 2, order: 'snake' }),
  x('multiTeamFormat', { pool: 'shared', firstPickRotates: true }),
  x('financialWindow', { mode: 'pctWindow', floorPct: 80, ceilingPct: 120 }),
  x('compensation', { amount: 500_000, unit: 'cap credits' }),
  x('houseRule', {
    title: 'Escalating compensation',
    note: 'Compensation doubles each additional time the same team loses a player.',
  }),
])

// The Mercy Draft: an invented gentle model — heavy protection, one pick per
// team, big compensation, and a pre-draft window so nobody is blindsided.
const mercy = model('exp-mercy', 'Mercy Draft — caponomics original', 'any', 1, [
  x('protectionScheme', { mode: 'flat', flatCount: 20 }),
  x('selectionQuota', { perTeam: 'atMost', count: 1 }),
  x('lossLimit', { maxLost: 1, elimination: true }),
  x('preDraftWindow', { days: 7, countsAsPick: true, maxPerTeam: 1 }),
  x('compensation', { amount: 2_000_000, unit: 'cap relief' }),
  x('sideDeals', { allowed: false }),
])

const blank = model('exp-blank', 'Blank canvas', 'any', 1, [])

export const EXPANSION_PRESETS: ExpansionModel[] = [
  nhlKraken,
  wnba2026,
  wnba2024,
  mls2024,
  nba2004,
  nfl2002,
  mlb1997,
  hydra,
  mercy,
  blank,
]

export const EXPANSION_PRESET_MAP: Record<string, ExpansionModel> = Object.fromEntries(
  EXPANSION_PRESETS.map((p) => [p.id, p]),
)

export const DEFAULT_EXPANSION_PRESET_ID = 'exp-nhl-2021'
