import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, str } from '../params'
import { ASSET_PENALTY_EFFECTS } from '../../data/enums'

/** Links spending to an asset penalty — e.g. the NBA second-apron pick freeze.
 *  Informational in MVP (there are no transactions to restrict yet): when the
 *  trigger is met it surfaces an asset penalty, not illegality. */
export const draftPickPenalty: CapModuleDef = {
  kind: 'draftPickPenalty',
  label: 'Draft Pick Penalty',
  category: 'penalty',
  phase: 'validate',
  blurb: 'Ties overspending to a draft-pick consequence (freeze / drop / forfeit).',
  paramSchema: [
    { key: 'threshold', label: 'Trigger over', type: 'money', default: 220_000_000, min: 0 },
    {
      key: 'thresholdMode',
      label: 'Threshold basis',
      type: 'enum',
      options: [
        { value: 'fixed', label: 'Fixed amount' },
        { value: 'percentOfCap', label: 'Percent of cap' },
      ],
      default: 'fixed',
    },
    { key: 'thresholdPercent', label: 'Percent of cap', type: 'percent', default: 118, min: 0, max: 300 },
    {
      key: 'effect',
      label: 'Effect',
      type: 'enum',
      options: ASSET_PENALTY_EFFECTS.map((e) => ({ value: e.value, label: e.label })),
      default: 'freeze',
    },
    { key: 'yearsOut', label: 'Pick years out', type: 'number', default: 7, min: 0 },
    { key: 'dropSpots', label: 'Drop N spots', type: 'number', default: 10, min: 0 },
  ],
  defaultParams: {
    threshold: 220_000_000,
    thresholdMode: 'fixed',
    thresholdPercent: 118,
    effect: 'freeze',
    yearsOut: 7,
    dropSpots: 10,
  },
  validate(p, ctx) {
    const cap = ctx.env.capValue
    const line =
      str(p, 'thresholdMode', 'fixed') === 'percentOfCap'
        ? cap === null
          ? null
          : Math.round((cap * num(p, 'thresholdPercent', 118)) / 100)
        : num(p, 'threshold')
    if (line === null) return result()
    if (ctx.totals.capSalary <= line) return result()
    const effect = str(p, 'effect', 'freeze')
    const desc =
      effect === 'dropSpots'
        ? `1st-round pick drops ${num(p, 'dropSpots', 10)} spots (spending over ${fmtMoney(line)}).`
        : effect === 'forfeit'
          ? `Forfeits a 1st-round pick (spending over ${fmtMoney(line)}).`
          : `Freezes its 1st-round pick ${num(p, 'yearsOut', 7)} drafts out (spending over ${fmtMoney(line)}).`
    return result({
      reasons: [{ severity: 'warning', module: 'draftPickPenalty', message: desc }],
      penalties: [{ currency: 'assets', description: desc, module: 'draftPickPenalty' }],
    })
  },
}
