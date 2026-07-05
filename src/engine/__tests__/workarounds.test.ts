import { describe, it, expect } from 'vitest'
import { evaluateRuleset } from '../evaluate'
import { PRESET_MAP } from '../../presets'
import { mlbSample } from '../../data/rosters'
import { mod, oneTeamLeague, ruleset } from './helpers'
import type { League } from '../types'

describe('amnesty (exclude workaround)', () => {
  const league = oneTeamLeague([['star', 50_000_000], ['b', 40_000_000], ['c', 30_000_000]]) // 120M

  it('over the hard cap without amnesty', () => {
    const r = ruleset([mod('hardCap', { source: 'fixed', ceiling: 100_000_000 })])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(false)
  })

  it('drops the top salary and comes under the cap', () => {
    const r = ruleset([
      mod('amnesty', { count: 1 }),
      mod('hardCap', { source: 'fixed', ceiling: 100_000_000 }),
    ])
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    expect(ty.totals.capSalary).toBe(70_000_000) // 50M excluded
    expect(ty.legal).toBe(true)
    expect(ty.readouts.find((x) => x.label === 'Amnesty relief')?.value).toBe(50_000_000)
  })
})

describe('dead money (counts toggle)', () => {
  const league = oneTeamLeague([['p1', 100_000_000]])

  it('counts against the cap when toggled on', () => {
    const r = ruleset([
      mod('deadMoney', { mode: 'fixed', amount: 10_000_000, countsTowardCap: true }),
      mod('hardCap', { source: 'fixed', ceiling: 100_000_000 }),
    ])
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    expect(ty.totals.capSalary).toBe(110_000_000)
    expect(ty.legal).toBe(false)
  })

  it('does not count when toggled off', () => {
    const r = ruleset([
      mod('deadMoney', { mode: 'fixed', amount: 10_000_000, countsTowardCap: false }),
      mod('hardCap', { source: 'fixed', ceiling: 100_000_000 }),
    ])
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    expect(ty.totals.capSalary).toBe(100_000_000)
    expect(ty.legal).toBe(true)
  })
})

describe('position sub-cap', () => {
  const league: League = {
    id: 't', name: 'T', currency: 'USD', seasonYears: [2026],
    players: {
      a: { id: 'a', name: 'Ace', pos: 'SP', serviceYears: 6 },
      b: { id: 'b', name: 'Bat', pos: 'OF', serviceYears: 6 },
    },
    teams: [{
      id: 't1', name: 'T1', flags: [],
      roster: [
        { id: 'ca', playerId: 'a', years: [2026], salaryByYear: { 2026: 60_000_000 } },
        { id: 'cb', playerId: 'b', years: [2026], salaryByYear: { 2026: 20_000_000 } },
      ],
    }],
  }

  it('flags overspending on a position group', () => {
    const r = ruleset([mod('positionCap', { positions: 'SP', mode: 'fixed', value: 50_000_000 })])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(false)
  })
  it('passes when under the sub-cap', () => {
    const r = ruleset([mod('positionCap', { positions: 'SP', mode: 'fixed', value: 70_000_000 })])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(true)
  })
})

describe('MLB CBT (current) preset', () => {
  it('taxes the Dodgers in the top tier but stays legal (no cap)', () => {
    const report = evaluateRuleset(mlbSample, PRESET_MAP['mlb-cbt']!)
    const lad = report.byTeamYear.find((t) => t.teamId === 'LAD')!
    // ~$306M − $244M ≈ $62M over → deep into the top tiers (~$24.8M owed)
    expect(lad.readouts.find((x) => x.label === 'Tax owed')?.value).toBeGreaterThan(24_000_000)
    expect(lad.legal).toBe(true)
    expect(lad.penalties.some((p) => p.module === 'draftPickPenalty')).toBe(true)
  })
})
