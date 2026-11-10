import { result, type CapModuleDef, type EvalContext } from '../module'
import { fmtMoney } from '../format'
import { num, objList } from '../params'
import type { Reason } from '../types'

/** Per-player ceiling: a contract's cap hit can't exceed a %-of-cap tier chosen
 *  by the player's service years. Players flagged by retainedRights (cornerstone)
 *  are exempt. Violations are illegal. */
export const maxContract: CapModuleDef = {
  kind: 'maxContract',
  label: 'Max Contract',
  category: 'contract',
  phase: 'validate',
  blurb: 'Limits each player’s salary to a percent of the cap, set by years of service. Players marked in Retained Rights are exempt.',
  paramSchema: [
    {
      key: 'tiers',
      label: 'Maximum by years of service',
      type: 'bracketList',
      itemSchema: [
        { key: 'minService', label: 'Min years of service', type: 'number', default: 0, min: 0 },
        { key: 'pctOfCap', label: 'Max % of cap', type: 'percent', default: 25, min: 0, max: 100 },
      ],
      default: [
        { minService: 0, pctOfCap: 25 },
        { minService: 7, pctOfCap: 30 },
        { minService: 10, pctOfCap: 35 },
      ],
    },
  ],
  defaultParams: {
    tiers: [
      { minService: 0, pctOfCap: 25 },
      { minService: 7, pctOfCap: 30 },
      { minService: 10, pctOfCap: 35 },
    ],
  },
  validate(p, ctx: EvalContext) {
    const cap = ctx.env.capValue
    if (cap === null) {
      return result({ reasons: [{ severity: 'warning', module: 'maxContract', message: 'No cap value is set, so the max contract was not checked.' }] })
    }
    const tiers = objList(p, 'tiers')
      .map((t) => ({ minService: num(t, 'minService', 0), pctOfCap: num(t, 'pctOfCap', 0) }))
      .sort((a, b) => a.minService - b.minService)
    if (!tiers.length) return result()

    const exempt = (ctx.scratch['exemptFromMax'] as Set<string>) ?? new Set<string>()
    const reasons: Reason[] = []
    let legal = true

    for (const c of ctx.team.roster) {
      const salary = c.salaryByYear[ctx.year]
      if (salary === undefined) continue
      if (exempt.has(c.playerId)) continue
      const service = ctx.league.players[c.playerId]?.serviceYears ?? 0
      // Highest tier whose threshold the player meets.
      let pct = tiers[0]!.pctOfCap
      for (const t of tiers) if (service >= t.minService) pct = t.pctOfCap
      const maxAllowed = Math.round((cap * pct) / 100)
      if (salary > maxAllowed) {
        legal = false
        const name = ctx.league.players[c.playerId]?.name ?? c.playerId
        reasons.push({ severity: 'error', module: 'maxContract', message: `${name} is paid ${fmtMoney(salary, (ctx.ruleset.currency ?? 'USD'))}. The maximum is ${fmtMoney(maxAllowed, (ctx.ruleset.currency ?? 'USD'))}, which is ${pct}% of the cap.` })
      }
    }
    return result({ legal, reasons })
  },
}
