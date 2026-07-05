import type { CapModuleDef } from '../module'
import { num, str, bool } from '../params'

/** A scenario knob for dead money — salary still owed to players no longer
 *  contributing. Without a transaction layer we can't *derive* it from cuts, so
 *  this injects a configurable dead-money charge per team, with a toggle for the
 *  central design question: does this cap system count dead money against the
 *  cap, or not? */
export const deadMoney: CapModuleDef = {
  kind: 'deadMoney',
  label: 'Dead Money',
  category: 'contract',
  phase: 'charge',
  blurb: 'Adds a dead-money charge per team, with a toggle for whether it counts against the cap.',
  paramSchema: [
    {
      key: 'mode',
      label: 'Amount basis',
      type: 'enum',
      options: [
        { value: 'percentOfPayroll', label: 'Percent of payroll' },
        { value: 'fixed', label: 'Fixed amount' },
      ],
      default: 'percentOfPayroll',
    },
    { key: 'percent', label: 'Percent of payroll', type: 'percent', default: 8, min: 0, max: 100 },
    { key: 'amount', label: 'Fixed amount', type: 'money', default: 10_000_000, min: 0 },
    { key: 'countsTowardCap', label: 'Counts against the cap', type: 'boolean', default: true },
  ],
  defaultParams: { mode: 'percentOfPayroll', percent: 8, amount: 10_000_000, countsTowardCap: true },
  contributes(p, ctx) {
    const amount =
      str(p, 'mode', 'percentOfPayroll') === 'fixed'
        ? num(p, 'amount')
        : Math.round((ctx.totals.capSalary * num(p, 'percent', 8)) / 100)
    if (amount <= 0) return []
    return [
      {
        year: ctx.year,
        amount,
        type: 'deadMoney',
        countsTowardCap: bool(p, 'countsTowardCap', true),
        sourceModule: 'deadMoney',
        note: 'Dead money',
      },
    ]
  },
}
