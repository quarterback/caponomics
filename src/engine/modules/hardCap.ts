import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, str } from '../params'

/** An absolute ceiling. Over it → illegal. Ceiling is a fixed value, the cap
 *  value itself, or a multiple of the cap value. */
export const hardCap: CapModuleDef = {
  kind: 'hardCap',
  label: 'Hard Cap',
  category: 'cap',
  phase: 'validate',
  blurb: 'A fixed ceiling on team salary. A team over the ceiling is illegal.',
  paramSchema: [
    {
      key: 'source',
      label: 'Set the ceiling as',
      type: 'enum',
      options: [
        { value: 'fixed', label: 'Fixed amount' },
        { value: 'useCapValue', label: 'The cap value' },
        { value: 'multipleOfCap', label: 'Percent of the cap value' },
      ],
      default: 'useCapValue',
    },
    { key: 'ceiling', label: 'Fixed ceiling', type: 'money', default: 100_000_000, min: 0 },
    { key: 'capMultiplePct', label: 'Percent of the cap value', type: 'percent', default: 100, min: 0, max: 500 },
    {
      key: 'basis',
      label: 'What counts toward the ceiling',
      type: 'enum',
      options: [
        { value: 'cap', label: 'Cap salary' },
        { value: 'cash', label: 'Cash spending' },
      ],
      default: 'cap',
    },
  ],
  defaultParams: { source: 'useCapValue', ceiling: 100_000_000, capMultiplePct: 100, basis: 'cap' },
  validate(p, ctx) {
    const source = str(p, 'source', 'useCapValue')
    const cap = ctx.env.capValue
    let ceiling: number | null
    if (source === 'fixed') ceiling = num(p, 'ceiling')
    else if (source === 'multipleOfCap') ceiling = cap === null ? null : Math.round((cap * num(p, 'capMultiplePct', 100)) / 100)
    else ceiling = cap
    if (ceiling === null) {
      return result({ reasons: [{ severity: 'warning', module: 'hardCap', message: 'No cap value is set, so the hard cap was not checked.' }] })
    }
    // Over-cap exceptions (Bird / MLE) extend a hard ceiling.
    const room = (ctx.env.scratch['overCapRoom'] as number) ?? 0
    if (room > 0) ceiling += room
    const cash = str(p, 'basis', 'cap') === 'cash'
    const measure = cash ? ctx.totals.cashSpend : ctx.totals.capSalary
    const over = measure - ceiling
    const readouts = [{ label: 'Hard cap room', value: -over, format: 'money' as const, module: 'hardCap' }]
    if (over > 0) {
      return result({
        legal: false,
        readouts,
        reasons: [{ severity: 'error', module: 'hardCap', message: `${cash ? 'Cash spending' : 'Team salary'} of ${fmtMoney(measure, (ctx.ruleset.currency ?? 'USD'))} is ${fmtMoney(over, (ctx.ruleset.currency ?? 'USD'))} over the hard cap of ${fmtMoney(ceiling, (ctx.ruleset.currency ?? 'USD'))}.` }],
      })
    }
    return result({ readouts })
  },
}
