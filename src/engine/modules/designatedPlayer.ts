import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, str } from '../params'

/** A workaround, the "discount" transform: each team's N biggest salaries count
 *  only a fixed *budget charge* against the cap, not their full pay — the MLS
 *  Designated Player rule. The player's real salary comes off the cap; a flat
 *  charge goes on. Applied league-wide as a policy. */
export const designatedPlayer: CapModuleDef = {
  kind: 'designatedPlayer',
  label: 'Designated Player',
  category: 'exception',
  phase: 'charge',
  blurb: 'Each team’s N biggest salaries count only a fixed “budget charge” against the cap, not their full pay (the MLS DP rule).',
  paramSchema: [
    { key: 'count', label: 'Designated players per team', type: 'number', default: 3, min: 0, max: 10 },
    { key: 'budgetCharge', label: 'Budget charge (per DP)', type: 'money', default: 743_000, min: 0 },
    { key: 'label', label: 'Label', type: 'text', default: 'Designated Player', placeholder: 'DP / marquee' },
  ],
  defaultParams: { count: 3, budgetCharge: 743_000, label: 'Designated Player' },
  contributes(p, ctx) {
    const count = num(p, 'count', 3)
    const budget = num(p, 'budgetCharge', 743_000)
    if (count <= 0) return []
    const top = ctx.charges
      .filter((c) => c.type === 'base' && c.countsTowardCap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, count)
    const added = []
    for (const c of top) {
      if (c.amount <= budget) continue // no benefit — leave it counting in full
      c.countsTowardCap = false
      c.note = 'dp-full'
      added.push({
        year: ctx.year,
        amount: budget,
        type: 'hold' as const,
        countsTowardCap: true,
        playerId: c.playerId,
        sourceModule: 'designatedPlayer',
        note: 'dp-budget',
      })
    }
    return added
  },
  validate(_p, ctx) {
    const full = ctx.charges.filter((c) => c.note === 'dp-full').reduce((a, c) => a + c.amount, 0)
    const budget = ctx.charges.filter((c) => c.note === 'dp-budget').reduce((a, c) => a + c.amount, 0)
    const saved = full - budget
    if (saved <= 0) return result()
    const cur = ctx.ruleset.currency ?? 'USD'
    return result({
      readouts: [{ label: 'DP cap relief', value: saved, format: 'money', module: 'designatedPlayer' }],
      reasons: [{ severity: 'info', module: 'designatedPlayer', message: `${str(_p, 'label', 'Designated Player')}s move ${fmtMoney(saved, cur)} off the cap.` }],
    })
  },
}
