import { describe, it, expect } from 'vitest'
import { evaluateRuleset } from '../evaluate'
import { PRESET_MAP } from '../../presets'
import { mlbSample, nbaSample } from '../../data/rosters'
import type { TeamYearReport } from '../types'

function team(report: ReturnType<typeof evaluateRuleset>, id: string): TeamYearReport {
  const r = report.byTeamYear.find((t) => t.teamId === id)
  if (!r) throw new Error(`no team ${id}`)
  return r
}
function taxOwed(t: TeamYearReport): number {
  return t.readouts.find((x) => x.label === 'Tax owed')?.value ?? 0
}

describe('MLB-2026 preset × MLB sample (headline acceptance)', () => {
  const report = evaluateRuleset(mlbSample, PRESET_MAP['mlb-2026']!)

  it('Dodgers are illegal — over the hard cap and top tax tier', () => {
    const lad = team(report, 'LAD')
    expect(lad.legal).toBe(false)
    expect(lad.reasons.some((r) => r.module === 'hardCap' && r.severity === 'error')).toBe(true)
    expect(taxOwed(lad)).toBeGreaterThan(0)
  })

  it('Yankees are legal but in the tax', () => {
    const nyy = team(report, 'NYY')
    expect(nyy.legal).toBe(true)
    expect(taxOwed(nyy)).toBeGreaterThan(0)
  })

  it('Rays and Athletics are illegal — below the floor', () => {
    for (const id of ['TB', 'ATH']) {
      const t = team(report, id)
      expect(t.legal, `${id} should be below floor`).toBe(false)
      expect(t.reasons.some((r) => r.module === 'salaryFloor')).toBe(true)
    }
  })

  it('Athletics sit right at the roster minimum (24)', () => {
    expect(team(report, 'ATH').totals.playerCount).toBe(24)
  })
})

describe('NBA-2026 preset × NBA sample (apron ladder)', () => {
  const report = evaluateRuleset(nbaSample, PRESET_MAP['nba-2026']!)

  it('Celtics clear both aprons but remain legal (soft cap)', () => {
    const bos = team(report, 'BOS')
    expect(bos.flags).toContain('overApron1')
    expect(bos.flags).toContain('overApron2')
    expect(bos.legal).toBe(true)
    expect(taxOwed(bos)).toBeGreaterThan(0)
    expect(bos.penalties.some((p) => p.module === 'draftPickPenalty')).toBe(true)
  })

  it('Knicks are over the first apron only', () => {
    const nyk = team(report, 'NYK')
    expect(nyk.flags).toContain('overApron1')
    expect(nyk.flags).not.toContain('overApron2')
  })

  it('Jazz fall below the floor', () => {
    const uta = team(report, 'UTA')
    const gap = uta.readouts.find((x) => x.label === 'Floor gap')?.value ?? -1
    expect(gap).toBeGreaterThan(0)
  })
})

describe('Cross-league remix: NBA roster under the NHL hard cap', () => {
  it('every NBA team is illegal against the ~$92M NHL ceiling', () => {
    const report = evaluateRuleset(nbaSample, PRESET_MAP['nhl']!)
    expect(report.byTeamYear.every((t) => t.legal === false)).toBe(true)
    expect(report.byTeamYear.every((t) => t.reasons.some((r) => r.module === 'hardCap'))).toBe(true)
  })
})
