import { describe, it, expect } from 'vitest'
import { evaluateRuleset } from '../evaluate'
import { mod, oneTeamLeague, ruleset } from './helpers'

describe('evaluate pipeline', () => {
  it('a blank ruleset still yields a cap sheet and is legal', () => {
    const league = oneTeamLeague([['p1', 10_000_000], ['p2', 5_000_000]])
    const report = evaluateRuleset(league, ruleset([]))
    const ty = report.byTeamYear[0]!
    expect(ty.legal).toBe(true)
    expect(ty.totals.capSalary).toBe(15_000_000)
    expect(ty.capSheet.length).toBe(2)
  })

  it('a hard cap breach is illegal with one error reason', () => {
    const league = oneTeamLeague([['p1', 120_000_000]])
    const r = ruleset([mod('hardCap', { source: 'fixed', ceiling: 100_000_000 })])
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    expect(ty.legal).toBe(false)
    expect(ty.reasons.filter((x) => x.severity === 'error').length).toBe(1)
  })

  it('a floor shortfall penalty equals the exact gap', () => {
    const league = oneTeamLeague([['p1', 70_000_000]])
    const r = ruleset([mod('salaryFloor', { mode: 'fixed', value: 100_000_000, penalty: 'payShortfall' })])
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    const pen = ty.penalties.find((p) => p.module === 'salaryFloor')
    expect(pen?.amount).toBe(30_000_000)
    // Advisory floor → still "legal" (a penalty, not a hard violation).
    expect(ty.legal).toBe(true)
  })

  it('percent-of-cap thresholds read the cap value from capFormula', () => {
    const league = oneTeamLeague([['p1', 95_000_000]])
    const r = ruleset([
      mod('capFormula', { mode: 'fixed', fixedCap: 100_000_000 }),
      mod('salaryFloor', { mode: 'percentOfCap', percent: 90, hardFloor: true }),
    ])
    // 95M >= 90M floor → legal
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(true)
    const r2 = ruleset([
      mod('capFormula', { mode: 'fixed', fixedCap: 100_000_000 }),
      mod('salaryFloor', { mode: 'percentOfCap', percent: 90, hardFloor: true }),
    ])
    const poor = oneTeamLeague([['p1', 80_000_000]])
    expect(evaluateRuleset(poor, r2).byTeamYear[0]!.legal).toBe(false)
  })
})

describe('maxContract + retainedRights', () => {
  const cap = { mode: 'fixed', fixedCap: 100_000_000 }
  const league = oneTeamLeague([['star', 20_000_000, 8]]) // 20% of cap

  it('flags a player over the max', () => {
    const r = ruleset([
      mod('capFormula', cap),
      mod('maxContract', { tiers: [{ minService: 0, pctOfCap: 15 }] }),
    ])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(false)
  })

  it('exempts a cornerstone player from the max', () => {
    const r = ruleset([
      mod('capFormula', cap),
      mod('retainedRights', { effect: 'exemptFromMax', designatedPlayerIds: ['star'] }),
      mod('maxContract', { tiers: [{ minService: 0, pctOfCap: 15 }] }),
    ])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(true)
  })
})
