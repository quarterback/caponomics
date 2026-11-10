import { bool, num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** Round structure (MLB 1997 ran three rounds with +3 re-protections between
 *  them; WNBA 2026 ran two rounds with the first pick alternating). */
export const rounds: ExpansionModuleDef = {
  kind: 'rounds',
  label: 'Rounds',
  category: 'rounds',
  blurb: 'Sets the number of rounds. Teams can protect more players between rounds.',
  paramSchema: [
    { key: 'count', label: 'Rounds', type: 'number', default: 1, min: 1 },
    {
      key: 'reProtect',
      label: 'Extra protections per round (0 = off)',
      type: 'number',
      default: 0,
      min: 0,
      help: 'In the 1997 MLB draft, each team protected 3 more players after every round.',
    },
    {
      key: 'order',
      label: 'Pick order',
      type: 'enum',
      options: [
        { value: 'alternating', label: 'New first pick each round' },
        { value: 'snake', label: 'Reverses each round' },
        { value: 'fixed', label: 'Same every round' },
      ],
      default: 'alternating',
    },
  ],
  defaultParams: { count: 1, reProtect: 0, order: 'alternating' },
  describe(p, ctx) {
    const count = num(p, 'count', 1)
    const lines = [count === 1 ? 'The draft has one round.' : `The draft has ${count} rounds.`]
    const rp = num(p, 'reProtect', 0)
    if (rp > 0) lines.push(`Between rounds, each existing team protects ${rp} additional players.`)
    if (count > 1 || ctx.teamsAdded > 1) {
      const order = str(p, 'order', 'alternating')
      lines.push(
        order === 'snake'
          ? 'The pick order reverses each round.'
          : order === 'alternating'
            ? 'A different team picks first each round.'
            : 'The pick order is the same in every round.',
      )
    }
    return lines
  },
}

/** How multiple simultaneous expansion teams share the market (WNBA 2026:
 *  Toronto and Portland drew from one shared unprotected pool, alternating). */
export const multiTeamFormat: ExpansionModuleDef = {
  kind: 'multiTeamFormat',
  label: 'Multi-Team Format',
  category: 'rounds',
  blurb: 'When two or more teams join at once, they share one pool or hold separate drafts.',
  paramSchema: [
    {
      key: 'pool',
      label: 'Player pool',
      type: 'enum',
      options: [
        { value: 'shared', label: 'Shared pool, alternating picks' },
        { value: 'sequential', label: 'Separate drafts, one after another' },
      ],
      default: 'shared',
    },
    { key: 'firstPickRotates', label: 'A different new team picks first each round', type: 'boolean', default: true },
  ],
  defaultParams: { pool: 'shared', firstPickRotates: true },
  describe(p, ctx) {
    if (ctx.teamsAdded < 2) return ['This rule applies only when two or more teams join at once. Set “New teams joining at once” to 2 or more.']
    const lines = [
      str(p, 'pool', 'shared') === 'shared'
        ? `All ${ctx.teamsAdded} expansion teams draft from one shared unprotected pool and take turns picking.`
        : `The ${ctx.teamsAdded} expansion teams hold separate drafts in sequence. Existing teams protect again between drafts.`,
    ]
    if (bool(p, 'firstPickRotates', true)) lines.push('A different new team picks first each round.')
    return lines
  },
}
