import { fmtMoney } from '../../format'
import { num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** The money the new team must absorb (NHL: picks must total 60–100% of the
 *  cap; NFL 2002: claim 30 players OR $27.2M in contracts). */
export const financialWindow: ExpansionModuleDef = {
  kind: 'financialWindow',
  label: 'Financial Window',
  category: 'financial',
  blurb: 'How much salary the expansion roster must absorb (or stay under).',
  paramSchema: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'enum',
      options: [
        { value: 'pctWindow', label: '% of cap window' },
        { value: 'dollarOrCount', label: 'Dollar-or-count floor' },
      ],
      default: 'pctWindow',
    },
    { key: 'floorPct', label: 'Floor (% of cap)', type: 'percent', default: 60, min: 0, max: 200 },
    { key: 'ceilingPct', label: 'Ceiling (% of cap)', type: 'percent', default: 100, min: 0, max: 200 },
    { key: 'countFloor', label: 'Player-count floor', type: 'number', default: 30, min: 0 },
    { key: 'dollarFloor', label: 'Dollar floor', type: 'money', default: 27_200_000, min: 0 },
  ],
  defaultParams: { mode: 'pctWindow', floorPct: 60, ceilingPct: 100, countFloor: 30, dollarFloor: 27_200_000 },
  describe(p, ctx) {
    if (str(p, 'mode', 'pctWindow') === 'dollarOrCount') {
      return [
        `Each expansion team must claim at least ${num(p, 'countFloor', 30)} players or ${fmtMoney(num(p, 'dollarFloor', 0), ctx.currency)} in contracts, whichever comes first.`,
      ]
    }
    return [
      `Each expansion team's selected contracts must total between ${num(p, 'floorPct', 60)}% and ${num(p, 'ceilingPct', 100)}% of the league cap.`,
    ]
  },
}

/** Payment to the team that loses a player (MLS: $50k in allocation money). */
export const compensation: ExpansionModuleDef = {
  kind: 'compensation',
  label: 'Loss Compensation',
  category: 'financial',
  blurb: 'What a team receives when it loses a player.',
  paramSchema: [
    { key: 'amount', label: 'Amount per player lost', type: 'money', default: 50_000, min: 0 },
    { key: 'unit', label: 'Paid in', type: 'text', default: 'general allocation money' },
  ],
  defaultParams: { amount: 50_000, unit: 'general allocation money' },
  describe(p, ctx) {
    return [
      `Each team that loses a player receives ${fmtMoney(num(p, 'amount', 0), ctx.currency)} in ${str(p, 'unit', 'compensation')}.`,
    ]
  },
}

/** A smaller cap for the new team's first seasons (NBA: 66% in year one, 75%
 *  in year two). Bridges to the cap tab — the ramp is a cap-system fact. */
export const expansionCapRamp: ExpansionModuleDef = {
  kind: 'expansionCapRamp',
  label: 'Expansion Cap Ramp',
  category: 'financial',
  blurb: 'The new team plays under a reduced salary cap at first.',
  paramSchema: [
    { key: 'year1Pct', label: 'Year 1 (% of league cap)', type: 'percent', default: 66, min: 0, max: 100 },
    { key: 'year2Pct', label: 'Year 2 (% of league cap)', type: 'percent', default: 75, min: 0, max: 100 },
  ],
  defaultParams: { year1Pct: 66, year2Pct: 75 },
  describe(p) {
    return [
      `Each expansion team's salary cap is ${num(p, 'year1Pct', 66)}% of the league cap in its first season and ${num(p, 'year2Pct', 75)}% in its second, reaching the full cap in year three.`,
    ]
  },
}
