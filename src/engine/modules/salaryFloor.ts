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
  blurb: 'A minimum team spend. Falling below carries a shortfall penalty (or is advisory only).',
  paramSchema: [
    {
      key: 'mode',
      label: 'Floor basis',
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
      label: 'If below floor',
      type: 'enum',
      options: FLOOR_PENALTIES.map((f) => ({ value: f.value, label: f.label })),
      default: 'payShortfall',
    },
    {
      key: 'hardFloor',
      label: 'Treat as illegal (not just penalized)',
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
      return result({ reasons: [{ severity: 'warning', module: 'salaryFloor', message: 'No cap value set — floor not evaluated.' }] })
    }
    const spend = ctx.totals.capSalary
    const shortfall = floor - spend
    const readouts = [{ label: 'Floor gap', value: shortfall, format: 'money' as const, module: 'salaryFloor' }]
    if (shortfall > 0) {
      const penalty = str(p, 'penalty', 'payShortfall')
      const hard = p['hardFloor'] === true
      const reasons = [{ severity: (hard ? 'error' : 'warning') as 'error' | 'warning', module: 'salaryFloor', message: `Below the floor by ${fmtMoney(shortfall)} (${fmtMoney(spend)} / ${fmtMoney(floor)}).` }]
      const penalties =
        penalty === 'none'
          ? []
          : penalty === 'draftPenalty'
            ? [{ currency: 'assets' as const, description: 'Loses a draft pick for missing the floor.', module: 'salaryFloor' }]
            : [{ currency: 'money' as const, amount: shortfall, description: penalty === 'redistribute' ? 'Shortfall redistributed to other clubs.' : 'Must pay the shortfall.', module: 'salaryFloor' }]
      return result({ legal: !hard, readouts, reasons, penalties })
    }
    return result({ readouts })
  },
}
