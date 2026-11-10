import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, str } from '../params'
import { FLOOR_PENALTIES } from '../../data/enums'

/** A minimum a team must spend to. Below it → a shortfall penalty (money by
 *  default; can be advisory). */
export const salaryFloor: CapModuleDef = {
  kind: 'salaryFloor',
  label: 'Salary Floor',
  category: 'floor',
  phase: 'validate',
  blurb: 'The least a team must spend on salary. You choose what happens to a team that spends less.',
  paramSchema: [
    {
      key: 'mode',
      label: 'Set the floor as',
      type: 'enum',
      options: [
        { value: 'fixed', label: 'Fixed amount' },
        { value: 'percentOfCap', label: 'Percent of cap' },
      ],
      default: 'fixed',
    },
    { key: 'value', label: 'Fixed floor', type: 'money', default: 100_000_000, min: 0 },
    { key: 'percent', label: 'Percent of cap', type: 'percent', default: 90, min: 0, max: 100 },
    {
      key: 'penalty',
      label: 'If a team is below the floor',
      type: 'enum',
      options: FLOOR_PENALTIES.map((f) => ({ value: f.value, label: f.label })),
      default: 'payShortfall',
    },
    {
      key: 'hardFloor',
      label: 'Make a team below the floor illegal',
      type: 'boolean',
      default: false,
    },
  ],
  defaultParams: { mode: 'fixed', value: 100_000_000, percent: 90, penalty: 'payShortfall', hardFloor: false },
  validate(p, ctx) {
    const mode = str(p, 'mode', 'fixed')
    const cap = ctx.env.capValue
    let floor: number | null
    if (mode === 'percentOfCap') floor = cap === null ? null : Math.round((cap * num(p, 'percent', 90)) / 100)
    else floor = num(p, 'value')
    if (floor === null) {
      return result({ reasons: [{ severity: 'warning', module: 'salaryFloor', message: 'No cap value is set, so the salary floor was not checked.' }] })
    }
    const spend = ctx.totals.capSalary
    const shortfall = floor - spend
    const readouts = [{ label: 'Floor gap', value: shortfall, format: 'money' as const, module: 'salaryFloor' }]
    if (shortfall > 0) {
      const penalty = str(p, 'penalty', 'payShortfall')
      const hard = p['hardFloor'] === true
      const cur = (ctx.ruleset.currency ?? 'USD')
      const reasons = [{ severity: (hard ? 'error' : 'warning') as 'error' | 'warning', module: 'salaryFloor', message: `Team salary of ${fmtMoney(spend, cur)} is ${fmtMoney(shortfall, cur)} below the floor of ${fmtMoney(floor, cur)}.` }]
      const penalties =
        penalty === 'none'
          ? []
          : penalty === 'draftPenalty'
            ? [{ currency: 'assets' as const, description: 'The team loses a draft pick because it is below the floor.', module: 'salaryFloor' }]
            : [{ currency: 'money' as const, amount: shortfall, description: penalty === 'redistribute' ? 'The team pays the shortfall to the other clubs.' : 'The team must pay the shortfall.', module: 'salaryFloor' }]
      return result({ legal: !hard, readouts, reasons, penalties })
    }
    return result({ readouts })
  },
}
