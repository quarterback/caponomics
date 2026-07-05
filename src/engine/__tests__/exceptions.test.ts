import { describe, it, expect } from 'vitest'
import { evaluateRuleset } from '../evaluate'
import { mod, oneTeamLeague, ruleset } from './helpers'

describe('over-cap exception (raise the ceiling)', () => {
  const league = oneTeamLeague([['p1', 110_000_000]]) // $10M over a $100M cap

  it('is over a hard cap without an exception', () => {
    const r = ruleset([mod('hardCap', { source: 'fixed', ceiling: 100_000_000 })])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(false)
  })

  it('extends the ceiling and legalizes with a $15M exception', () => {
    const r = ruleset([
      mod('exception', { mode: 'fixed', amount: 15_000_000 }),
      mod('hardCap', { source: 'fixed', ceiling: 100_000_000 }),
    ])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(true)
  })

  it('does nothing in a soft-cap system (no hard line to extend)', () => {
    // luxuryTax only — an exception shouldn't change the tax owed.
    const base = ruleset([mod('luxuryTax', { thresholdMode: 'fixed', threshold: 100_000_000 })])
    const withExc = ruleset([
      mod('exception', { mode: 'fixed', amount: 15_000_000 }),
      mod('luxuryTax', { thresholdMode: 'fixed', threshold: 100_000_000 }),
    ])
    const t1 = evaluateRuleset(league, base).byTeamYear[0]!.readouts.find((x) => x.label === 'Tax owed')?.value
    const t2 = evaluateRuleset(league, withExc).byTeamYear[0]!.readouts.find((x) => x.label === 'Tax owed')?.value
    expect(t2).toBe(t1)
  })
})

describe('designated player (discount)', () => {
  const league = oneTeamLeague([['star', 20_000_000], ['b', 5_000_000], ['c', 3_000_000]]) // $28M

  it('replaces top salaries with a fixed budget charge', () => {
    const r = ruleset([mod('designatedPlayer', { count: 1, budgetCharge: 1_000_000 })])
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    // $20M star → $1M budget charge; total 28M − 20M + 1M = 9M
    expect(ty.totals.capSalary).toBe(9_000_000)
    expect(ty.readouts.find((x) => x.label === 'DP cap relief')?.value).toBe(19_000_000)
  })

  it('legalizes a team under a hard cap by discounting its stars', () => {
    const r = ruleset([
      mod('designatedPlayer', { count: 1, budgetCharge: 1_000_000 }),
      mod('hardCap', { source: 'fixed', ceiling: 15_000_000 }),
    ])
    // 9M ≤ 15M → legal (28M would have been illegal)
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(true)
  })
})
