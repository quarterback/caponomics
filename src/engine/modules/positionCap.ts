import { result, type CapModuleDef } from '../module'
import { fmtMoney } from '../format'
import { num, str } from '../params'

/** A composition constraint: cap spending on a position group (e.g. ≤X% of the
 *  cap on pitchers, or on QBs). A different *shape* of cap — it forces roster
 *  balance rather than limiting total spend. Positions are matched against each
 *  player's `pos`. */
export const positionCap: CapModuleDef = {
  kind: 'positionCap',
  label: 'Position Sub-Cap',
  category: 'roster',
  phase: 'validate',
  blurb: 'Limits how much a team can spend on one group of positions (forces roster balance).',
  paramSchema: [
    { key: 'label', label: 'Label', type: 'text', default: 'Position cap', placeholder: 'e.g. Pitching cap' },
    { key: 'positions', label: 'Positions (comma-separated)', type: 'text', default: 'SP,RP', placeholder: 'SP,RP  or  QB' },
    {
      key: 'mode',
      label: 'Limit basis',
      type: 'enum',
      options: [
        { value: 'percentOfCap', label: 'Percent of cap' },
        { value: 'fixed', label: 'Fixed amount' },
      ],
      default: 'percentOfCap',
    },
    { key: 'percent', label: 'Max % of cap', type: 'percent', default: 40, min: 0, max: 100 },
    { key: 'value', label: 'Max amount', type: 'money', default: 50_000_000, min: 0 },
  ],
  defaultParams: { label: 'Position cap', positions: 'SP,RP', mode: 'percentOfCap', percent: 40, value: 50_000_000 },
  validate(p, ctx) {
    const set = new Set(
      str(p, 'positions', '')
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    )
    if (!set.size) return result()
    const cur = ctx.ruleset.currency ?? 'USD'
    const cap = ctx.env.capValue
    let limit: number | null
    if (str(p, 'mode', 'percentOfCap') === 'fixed') limit = num(p, 'value')
    else limit = cap === null ? null : Math.round((cap * num(p, 'percent', 40)) / 100)
    if (limit === null) return result()

    const spend = ctx.charges
      .filter((c) => c.countsTowardCap && c.playerId && set.has((ctx.league.players[c.playerId]?.pos ?? '').toUpperCase()))
      .reduce((a, c) => a + c.amount, 0)

    const label = str(p, 'label', 'Position cap')
    const readouts = [{ label: `${label} room`, value: limit - spend, format: 'money' as const, module: 'positionCap' }]
    if (spend > limit) {
      return result({
        legal: false,
        readouts,
        reasons: [{ severity: 'error', module: 'positionCap', message: `${label}: ${fmtMoney(spend, cur)} on ${[...set].join('/')} exceeds the ${fmtMoney(limit, cur)} limit.` }],
      })
    }
    return result({ readouts })
  },
}
