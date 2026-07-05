import { describe, it, expect } from 'vitest'
import { evaluateRuleset } from '../evaluate'
import { convertRulesetMoney } from '../currency'
import { fx } from '../format'
import { mod, oneTeamLeague, ruleset } from './helpers'

describe('currency FX in evaluation', () => {
  it('converts a league priced in GBP into a USD ruleset', () => {
    // £100M payroll under a $100M hard cap → converts to ~$127M → over.
    const league = oneTeamLeague([['p1', 100_000_000]])
    league.currency = 'GBP'
    const r = ruleset([mod('hardCap', { source: 'fixed', ceiling: 100_000_000 })])
    r.currency = 'USD'
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    expect(ty.totals.capSalary).toBe(fx(100_000_000, 'GBP', 'USD')) // ~127M
    expect(ty.legal).toBe(false)
  })

  it('same currency is a no-op (factor 1)', () => {
    const league = oneTeamLeague([['p1', 90_000_000]])
    league.currency = 'USD'
    const r = ruleset([mod('hardCap', { source: 'fixed', ceiling: 100_000_000 })])
    r.currency = 'USD'
    const ty = evaluateRuleset(league, r).byTeamYear[0]!
    expect(ty.totals.capSalary).toBe(90_000_000)
    expect(ty.legal).toBe(true)
  })
})

describe('convertRulesetMoney', () => {
  it('rescales money params (and bracket money) but leaves percents alone', () => {
    const r = ruleset([
      mod('hardCap', { source: 'fixed', ceiling: 100_000_000 }),
      mod('luxuryTax', {
        thresholdMode: 'fixed',
        threshold: 200_000_000,
        brackets: [{ upTo: 20_000_000, rate: 20 }],
      }),
    ])
    convertRulesetMoney(r, 'USD', 'GBP')
    const hc = r.modules[0]!.params
    const lt = r.modules[1]!.params
    expect(hc['ceiling']).toBe(fx(100_000_000, 'USD', 'GBP'))
    expect(lt['threshold']).toBe(fx(200_000_000, 'USD', 'GBP'))
    // bracket money converted, rate (a percent) untouched
    expect((lt['brackets'] as { upTo: number; rate: number }[])[0]!.upTo).toBe(fx(20_000_000, 'USD', 'GBP'))
    expect((lt['brackets'] as { upTo: number; rate: number }[])[0]!.rate).toBe(20)
  })
})
