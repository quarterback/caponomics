import { describe, it, expect } from 'vitest'
import { evaluateRuleset } from '../evaluate'
import { mod, oneTeamLeague, ruleset } from './helpers'

function taxOwed(capSalary: number, extra: Record<string, unknown> = {}): number {
  // Single player carrying the whole payroll, no min/max modules.
  const league = oneTeamLeague([['p1', capSalary]])
  const r = ruleset([
    mod('luxuryTax', {
      thresholdMode: 'fixed',
      threshold: 240_000_000,
      brackets: [
        { upTo: 20_000_000, rate: 20 },
        { upTo: 40_000_000, rate: 32 },
        { upTo: 0, rate: 50 },
      ],
      ...extra,
    }),
  ])
  const report = evaluateRuleset(league, r)
  const readout = report.byTeamYear[0]!.readouts.find((x) => x.label === 'Tax owed')
  return readout?.value ?? -1
}

describe('luxuryTax', () => {
  it('charges marginal brackets exactly ($265M → $5.6M)', () => {
    // overage 25M: 20M@20% = 4.0M ; 5M@32% = 1.6M ; total 5.6M
    expect(taxOwed(265_000_000)).toBe(5_600_000)
  })

  it('is zero under the threshold', () => {
    expect(taxOwed(200_000_000)).toBe(0)
  })

  it('reaches the top (infinite) bracket ($300M)', () => {
    // overage 60M: 20M@20%=4M ; 20M@32%=6.4M ; 20M@50%=10M ; total 20.4M
    expect(taxOwed(300_000_000)).toBe(20_400_000)
  })

  it('applies a repeater surcharge on top', () => {
    // base 5.6M + 10% surcharge = 6.16M
    expect(taxOwed(265_000_000, { isRepeater: true, repeaterSurchargePct: 10 })).toBe(6_160_000)
  })

  it('never makes a team illegal (tax is a price)', () => {
    const league = oneTeamLeague([['p1', 300_000_000]])
    const r = ruleset([mod('luxuryTax', { thresholdMode: 'fixed', threshold: 240_000_000 })])
    expect(evaluateRuleset(league, r).byTeamYear[0]!.legal).toBe(true)
  })
})
