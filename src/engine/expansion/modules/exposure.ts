import { bool, num, objList, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** The flip side of protection: each existing team must leave a minimum number
 *  of *useful* players available (NHL: 2 F + 1 D meeting games-played and
 *  under-contract tests, plus a goalie; NBA: at least 1; NFL: list 5). */
export const exposureMinimums: ExpansionModuleDef = {
  kind: 'exposureMinimums',
  label: 'Exposure Minimums',
  category: 'exposure',
  blurb: 'Each existing team must expose a set number of players who meet eligibility tests.',
  paramSchema: [
    {
      key: 'quotas',
      label: 'Each team must expose',
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
      help: 'This test stops teams from exposing only players who rarely play.',
    },
    { key: 'minGamesTwoSeasons', label: 'Or min games over two seasons (0 = off)', type: 'number', default: 70, min: 0 },
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
    const lines = [`Each existing team must expose at least ${quotas.join(', ')}.`]
    const tests: string[] = []
    if (bool(p, 'underContract', true)) tests.push('be under contract for next season')
    const g1 = num(p, 'minGames', 0)
    const g2 = num(p, 'minGamesTwoSeasons', 0)
    if (g1 > 0 && g2 > 0) tests.push(`have played ${g1} or more games last season, or ${g2} or more over the last two seasons`)
    else if (g1 > 0) tests.push(`have played ${g1} or more games last season`)
    if (tests.length) lines.push(`Exposed players must ${tests.join(' and ')}.`)
    return lines
  },
}

/** NFL 2002 oddity worth keeping: caps how many big-raise contracts a team may
 *  stuff into its exposure list (so the pool isn't all poison pills). */
export const expensiveListingCap: ExpansionModuleDef = {
  kind: 'expensiveListingCap',
  label: 'Expensive-Contract Exposure Limit',
  category: 'exposure',
  blurb: 'Limits how many high-salary players a team may expose.',
  paramSchema: [
    { key: 'maxCount', label: 'Max expensive players exposed', type: 'number', default: 2, min: 0 },
    { key: 'raisePct', label: 'Raise that counts as expensive', type: 'percent', default: 75, min: 0, max: 300 },
  ],
  defaultParams: { maxCount: 2, raisePct: 75 },
  describe(p) {
    return [
      `Each team may expose at most ${num(p, 'maxCount', 2)} players whose cap and cash figures are more than ${num(p, 'raisePct', 75)}% above last season’s. This stops teams from filling the pool with contracts no team would take.`,
    ]
  },
}
