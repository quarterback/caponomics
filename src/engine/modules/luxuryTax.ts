import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, objList, str } from '../params'

/** Priced overage above a threshold: marginal brackets + an optional repeater
 *  surcharge. A tax is a *price*, not illegality — so this never sets legal=false;
 *  it emits a money readout + penalty. */
export const luxuryTax: CapModuleDef = {
  kind: 'luxuryTax',
  label: 'Luxury Tax',
  category: 'tax',
  phase: 'validate',
  blurb: 'A price on spending above a threshold, charged in marginal brackets. Optional repeater surcharge.',
  paramSchema: [
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
    { key: 'threshold', label: 'Tax threshold', type: 'money', default: 200_000_000, min: 0 },
    { key: 'thresholdPercent', label: 'Percent of cap', type: 'percent', default: 120, min: 0, max: 300 },
    {
      key: 'brackets',
      label: 'Marginal brackets',
      type: 'bracketList',
      itemSchema: [
        { key: 'upTo', label: 'Up to overage of (0 = ∞)', type: 'money', default: 0, min: 0 },
        { key: 'rate', label: 'Rate', type: 'percent', default: 20, min: 0, max: 500 },
      ],
      default: [
        { upTo: 20_000_000, rate: 20 },
        { upTo: 40_000_000, rate: 32 },
        { upTo: 0, rate: 50 },
      ],
    },
    { key: 'isRepeater', label: 'Repeater team', type: 'boolean', default: false },
    { key: 'repeaterSurchargePct', label: 'Repeater surcharge', type: 'percent', default: 0, min: 0, max: 200 },
  ],
  defaultParams: {
    thresholdMode: 'fixed',
    threshold: 200_000_000,
    thresholdPercent: 120,
    brackets: [
      { upTo: 20_000_000, rate: 20 },
      { upTo: 40_000_000, rate: 32 },
      { upTo: 0, rate: 50 },
    ],
    isRepeater: false,
    repeaterSurchargePct: 0,
  },
  validate(p, ctx) {
    const cap = ctx.env.capValue
    const threshold =
      str(p, 'thresholdMode', 'fixed') === 'percentOfCap'
        ? cap === null
          ? null
          : Math.round((cap * num(p, 'thresholdPercent', 120)) / 100)
        : num(p, 'threshold')
    if (threshold === null) {
      return result({ reasons: [{ severity: 'warning', module: 'luxuryTax', message: 'No cap value set — luxury tax not evaluated.' }] })
    }
    const overage = ctx.totals.capSalary - threshold
    if (overage <= 0) {
      return result({ readouts: [{ label: 'Tax owed', value: 0, format: 'money', module: 'luxuryTax' }] })
    }

    // Marginal brackets. `upTo` is the top of each band measured in *overage*
    // dollars; 0 means "to infinity". Bands apply in listed order.
    const brackets = objList(p, 'brackets').map((b) => ({ upTo: num(b, 'upTo', 0), rate: num(b, 'rate', 0) }))
    let tax = 0
    let prevCap = 0
    let remaining = overage
    for (const b of brackets) {
      if (remaining <= 0) break
      const band = b.upTo === 0 ? remaining : Math.max(0, Math.min(remaining, b.upTo - prevCap))
      tax += Math.round((band * b.rate) / 100)
      remaining -= band
      prevCap = b.upTo === 0 ? prevCap : b.upTo
    }
    // Anything past the last finite bracket falls under the last rate.
    if (remaining > 0 && brackets.length) {
      const last = brackets[brackets.length - 1]!
      tax += Math.round((remaining * last.rate) / 100)
    }

    const repeater = p['isRepeater'] === true ? num(p, 'repeaterSurchargePct', 0) : 0
    const surcharge = repeater > 0 ? Math.round((tax * repeater) / 100) : 0
    const total = tax + surcharge

    const readouts = [{ label: 'Tax owed', value: total, format: 'money' as const, module: 'luxuryTax' }]
    const cur = ctx.league.currency
    const reasons = [{ severity: 'info' as const, module: 'luxuryTax', message: `In the tax by ${fmtMoney(overage, cur)}; owes ${fmtMoney(total, cur)}${surcharge ? ` (incl. ${fmtMoney(surcharge, cur)} repeater)` : ''}.` }]
    return result({ readouts, reasons, penalties: [{ currency: 'money', amount: total, description: 'Luxury tax owed.', module: 'luxuryTax' }] })
  },
}
