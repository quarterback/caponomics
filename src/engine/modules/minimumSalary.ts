import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, objList, str } from '../params'
import type { Reason } from '../types'

/** No contract may pay below a minimum — flat, or a step function of service. */
export const minimumSalary: CapModuleDef = {
  kind: 'minimumSalary',
  label: 'Minimum Salary',
  category: 'contract',
  phase: 'validate',
  blurb: 'A salary floor for individual contracts — a flat minimum or a step function of service years.',
  paramSchema: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'enum',
      options: [
        { value: 'flat', label: 'Flat minimum' },
        { value: 'byService', label: 'By service years' },
      ],
      default: 'flat',
    },
    { key: 'flat', label: 'Flat minimum', type: 'money', default: 780_000, min: 0 },
    {
      key: 'tiers',
      label: 'Minimum by service',
      type: 'bracketList',
      itemSchema: [
        { key: 'minService', label: 'Min service years', type: 'number', default: 0, min: 0 },
        { key: 'amount', label: 'Minimum', type: 'money', default: 780_000, min: 0 },
      ],
      default: [
        { minService: 0, amount: 780_000 },
        { minService: 3, amount: 1_100_000 },
      ],
    },
  ],
  defaultParams: {
    mode: 'flat',
    flat: 780_000,
    tiers: [
      { minService: 0, amount: 780_000 },
      { minService: 3, amount: 1_100_000 },
    ],
  },
  validate(p, ctx) {
    const mode = str(p, 'mode', 'flat')
    const tiers = objList(p, 'tiers')
      .map((t) => ({ minService: num(t, 'minService', 0), amount: num(t, 'amount', 0) }))
      .sort((a, b) => a.minService - b.minService)
    const reasons: Reason[] = []
    let legal = true
    for (const c of ctx.team.roster) {
      const salary = c.salaryByYear[ctx.year]
      if (salary === undefined) continue
      const service = ctx.league.players[c.playerId]?.serviceYears ?? 0
      let min = num(p, 'flat', 0)
      if (mode === 'byService' && tiers.length) {
        min = tiers[0]!.amount
        for (const t of tiers) if (service >= t.minService) min = t.amount
      }
      if (salary < min) {
        legal = false
        const name = ctx.league.players[c.playerId]?.name ?? c.playerId
        reasons.push({ severity: 'error', module: 'minimumSalary', message: `${name} at ${fmtMoney(salary, (ctx.ruleset.currency ?? 'USD'))} is below the minimum (${fmtMoney(min, (ctx.ruleset.currency ?? 'USD'))}).` })
      }
    }
    return result({ legal, reasons })
  },
}
