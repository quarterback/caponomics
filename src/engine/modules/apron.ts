import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, str, strList } from '../params'
import { APRON_RESTRICTIONS } from '../../data/enums'

/** A restriction line above the tax. In MVP the restrictions constrain
 *  *transactions* (which don't exist yet), so being over an apron is surfaced as
 *  a warning + the active restriction set — not hard illegality. */
export const apron: CapModuleDef = {
  kind: 'apron',
  label: 'Apron',
  category: 'apron',
  phase: 'validate',
  blurb: 'A line above the tax that unlocks roster-building restrictions when crossed (informational in this build).',
  paramSchema: [
    { key: 'level', label: 'Apron level', type: 'number', default: 1, min: 1, max: 5 },
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
    { key: 'threshold', label: 'Apron line', type: 'money', default: 220_000_000, min: 0 },
    { key: 'thresholdPercent', label: 'Percent of cap', type: 'percent', default: 115, min: 0, max: 300 },
    {
      key: 'restrictions',
      label: 'Restrictions when over',
      type: 'enumMulti',
      options: APRON_RESTRICTIONS.map((r) => ({ value: r.value, label: r.label })),
      default: ['noSignAndTrade'],
    },
  ],
  defaultParams: {
    level: 1,
    thresholdMode: 'fixed',
    threshold: 220_000_000,
    thresholdPercent: 115,
    restrictions: ['noSignAndTrade'],
  },
  validate(p, ctx) {
    const cap = ctx.env.capValue
    const level = num(p, 'level', 1)
    const line =
      str(p, 'thresholdMode', 'fixed') === 'percentOfCap'
        ? cap === null
          ? null
          : Math.round((cap * num(p, 'thresholdPercent', 115)) / 100)
        : num(p, 'threshold')
    if (line === null) {
      return result({ reasons: [{ severity: 'warning', module: 'apron', message: `No cap value set — apron ${level} not evaluated.` }] })
    }
    const distance = line - ctx.totals.capSalary
    const readouts = [{ label: `Apron ${level} distance`, value: distance, format: 'money' as const, module: 'apron' }]
    if (distance < 0) {
      ctx.flags.push(`overApron${level}`)
      const active = strList(p, 'restrictions')
      const labels = active
        .map((v) => APRON_RESTRICTIONS.find((r) => r.value === v)?.label ?? v)
        .join(', ')
      return result({
        readouts,
        reasons: [{ severity: 'warning', module: 'apron', message: `Over apron ${level} by ${fmtMoney(-distance)}. Active restrictions: ${labels || 'none'}.` }],
        penalties: active.length ? [{ currency: 'tools', description: `Apron ${level}: ${labels}`, module: 'apron' }] : [],
      })
    }
    return result({ readouts })
  },
}
