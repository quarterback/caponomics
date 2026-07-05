import { bool, num, objList, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** The flip side of protection: each existing team must leave a minimum number
 *  of *useful* players available (NHL: 2 F + 1 D meeting games-played and
 *  under-contract tests, plus a goalie; NBA: at least 1; NFL: list 5). */
export const exposureMinimums: ExpansionModuleDef = {
  kind: 'exposureMinimums',
  label: 'Exposure Minimums',
  category: 'exposure',
  blurb: 'Each existing team must expose at least N players meeting an eligibility test.',
  paramSchema: [
    {
      key: 'quotas',
      label: 'Must expose (per team)',
      type: 'bracketList',
      itemSchema: [
        { key: 'pos', label: 'Position', type: 'text', default: 'Any' },
        { key: 'count', label: 'Count', type: 'number', default: 1, min: 0 },
      ],
      default: [
        { pos: 'F', count: 2 },
        { pos: 'D', count: 1 },
        { pos: 'G', count: 1 },
      ],
    },
    { key: 'underContract', label: 'Must be under contract next season', type: 'boolean', default: true },
    {
      key: 'minGames',
      label: 'Min games last season (0 = off)',
      type: 'number',
      default: 40,
      min: 0,
      help: 'An activity test so teams can’t expose only shelf players.',
    },
    { key: 'minGamesTwoSeasons', label: '…or min games over two seasons (0 = off)', type: 'number', default: 70, min: 0 },
  ],
  defaultParams: {
    quotas: [
      { pos: 'F', count: 2 },
      { pos: 'D', count: 1 },
      { pos: 'G', count: 1 },
    ],
    underContract: true,
    minGames: 40,
    minGamesTwoSeasons: 70,
  },
  describe(p) {
    const quotas = objList(p, 'quotas').map((r) => `${num(r, 'count', 0)} ${str(r, 'pos', '?')}`)
    const lines = [`Each existing team must expose at least ${quotas.join(' + ')}.`]
    const tests: string[] = []
    if (bool(p, 'underContract', true)) tests.push('be under contract for next season')
    const g1 = num(p, 'minGames', 0)
    const g2 = num(p, 'minGamesTwoSeasons', 0)
    if (g1 > 0 && g2 > 0) tests.push(`have played ${g1}+ games last season or ${g2}+ over the last two`)
    else if (g1 > 0) tests.push(`have played ${g1}+ games last season`)
    if (tests.length) lines.push(`Exposed players must ${tests.join(' and ')}.`)
    return lines
  },
}

/** NFL 2002 oddity worth keeping: caps how many big-raise contracts a team may
 *  stuff into its exposure list (so the pool isn't all poison pills). */
export const expensiveListingCap: ExpansionModuleDef = {
  kind: 'expensiveListingCap',
  label: 'Expensive-Contract Listing Cap',
  category: 'exposure',
  blurb: 'Limits how many high-salary players a team may expose.',
  paramSchema: [
    { key: 'maxCount', label: 'Max expensive players exposed', type: 'number', default: 2, min: 0 },
    { key: 'raisePct', label: 'Salary raise threshold', type: 'percent', default: 75, min: 0, max: 300 },
  ],
  defaultParams: { maxCount: 2, raisePct: 75 },
  describe(p) {
    return [
      `At most ${num(p, 'maxCount', 2)} exposed players per team may carry cap and cash numbers more than ${num(p, 'raisePct', 75)}% above last season's — no stacking the pool with poison-pill contracts.`,
    ]
  },
}
