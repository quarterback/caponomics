import { result, type CapModuleDef } from '../module'
import { num } from '../params'

/** Roster-size bounds. Outside [min, max] → illegal. */
export const rosterLimits: CapModuleDef = {
  kind: 'rosterLimits',
  label: 'Roster Limits',
  category: 'roster',
  phase: 'validate',
  blurb: 'Minimum and maximum number of players on the roster.',
  paramSchema: [
    { key: 'min', label: 'Min players', type: 'number', default: 0, min: 0 },
    { key: 'max', label: 'Max players', type: 'number', default: 15, min: 0 },
  ],
  defaultParams: { min: 0, max: 15 },
  validate(p, ctx) {
    const min = num(p, 'min', 0)
    const max = num(p, 'max', 9999)
    const count = ctx.totals.playerCount
    const readouts = [{ label: 'Roster size', value: count, format: 'number' as const, module: 'rosterLimits' }]
    if (count > max) {
      return result({ legal: false, readouts, reasons: [{ severity: 'error', module: 'rosterLimits', message: `Roster of ${count} exceeds the max of ${max}.` }] })
    }
    if (count < min) {
      return result({ legal: false, readouts, reasons: [{ severity: 'error', module: 'rosterLimits', message: `Roster of ${count} is below the min of ${min}.` }] })
    }
    return result({ readouts })
  },
}
