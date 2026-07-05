import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num } from '../params'

/** A workaround, not a rule: each team may EXCLUDE its N largest salaries from
 *  the cap (the player is still paid — the money just stops counting). Models the
 *  NBA's one-time amnesty and, more generally, any "one free pass" carve-out.
 *  Applied league-wide as a policy: it drops each team's top-N cap hits. */
export const amnesty: CapModuleDef = {
  kind: 'amnesty',
  label: 'Amnesty',
  category: 'exception',
  phase: 'charge',
  blurb: 'Each team excludes its N biggest salaries from the cap (still paid, just off the books).',
  paramSchema: [
    { key: 'count', label: 'Amnesties per team', type: 'number', default: 1, min: 0, max: 10 },
    { key: 'label', label: 'Label', type: 'text', default: 'Amnesty', placeholder: 'Amnesty / stretch' },
  ],
  defaultParams: { count: 1, label: 'Amnesty' },
  contributes(p, ctx) {
    const count = num(p, 'count', 1)
    if (count <= 0) return []
    const top = ctx.charges
      .filter((c) => c.type === 'base' && c.countsTowardCap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, count)
    for (const c of top) {
      c.countsTowardCap = false
      c.note = 'amnestied'
    }
    return []
  },
  validate(_p, ctx) {
    const saved = ctx.charges.filter((c) => c.note === 'amnestied').reduce((a, c) => a + c.amount, 0)
    if (saved <= 0) return result()
    const cur = ctx.ruleset.currency ?? 'USD'
    return result({
      readouts: [{ label: 'Amnesty relief', value: saved, format: 'money', module: 'amnesty' }],
      reasons: [{ severity: 'info', module: 'amnesty', message: `Excluded ${fmtMoney(saved, cur)} from the cap via amnesty.` }],
    })
  },
}
