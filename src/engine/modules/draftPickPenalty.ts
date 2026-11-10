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
  blurb: 'A team over a set spending line has a first-round pick frozen, moved down or forfeited.',
  paramSchema: [
    { key: 'threshold', label: 'Applies over', type: 'money', default: 220_000_000, min: 0 },
    {
      key: 'thresholdMode',
      label: 'Based on',
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
    { key: 'yearsOut', label: 'Drafts ahead', type: 'number', default: 7, min: 0 },
    { key: 'dropSpots', label: 'Spots dropped', type: 'number', default: 10, min: 0 },
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
    const cur = (ctx.ruleset.currency ?? 'USD')
    const desc =
      effect === 'dropSpots'
        ? `Team salary is over ${fmtMoney(line, cur)}, so the team’s first-round pick moves down ${num(p, 'dropSpots', 10)} spots.`
        : effect === 'forfeit'
          ? `Team salary is over ${fmtMoney(line, cur)}, so the team forfeits a first-round pick.`
          : `Team salary is over ${fmtMoney(line, cur)}, so the team cannot trade its first-round pick ${num(p, 'yearsOut', 7)} drafts ahead.`
    return result({
      reasons: [{ severity: 'warning', module: 'draftPickPenalty', message: desc }],
      penalties: [{ currency: 'assets', description: desc, module: 'draftPickPenalty' }],
    })
  },
}
