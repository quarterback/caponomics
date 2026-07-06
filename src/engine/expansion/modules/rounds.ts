import { bool, num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** Round structure (MLB 1997 ran three rounds with +3 re-protections between
 *  them; WNBA 2026 ran two rounds with the first pick alternating). */
export const rounds: ExpansionModuleDef = {
  kind: 'rounds',
  label: 'Rounds',
  category: 'rounds',
  blurb: 'Single or multi-round, with optional re-protection between rounds.',
  paramSchema: [
    { key: 'count', label: 'Rounds', type: 'number', default: 1, min: 1 },
    {
      key: 'reProtect',
      label: 'Extra protections per round (0 = off)',
      type: 'number',
      default: 0,
      min: 0,
      help: 'MLB 1997: each team protected 3 more players after every round.',
    },
    {
      key: 'order',
      label: 'Pick order',
      type: 'enum',
      options: [
        { value: 'alternating', label: 'Alternating' },
        { value: 'snake', label: 'Snake' },
        { value: 'fixed', label: 'Fixed' },
      ],
      default: 'alternating',
    },
  ],
  defaultParams: { count: 1, reProtect: 0, order: 'alternating' },
  describe(p, ctx) {
    const count = num(p, 'count', 1)
    const lines = [count === 1 ? 'The draft is a single round.' : `The draft runs ${count} rounds.`]
    const rp = num(p, 'reProtect', 0)
    if (rp > 0) lines.push(`Between rounds, each existing team protects ${rp} additional players.`)
    if (count > 1 || ctx.teamsAdded > 1) {
      const order = str(p, 'order', 'alternating')
      lines.push(
        order === 'snake'
          ? 'Pick order snakes (reverses each round).'
          : order === 'alternating'
            ? 'Pick order alternates — a different team picks first each round.'
            : 'Pick order is fixed for every round.',
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
  blurb: 'Shared pool vs. separate drafts when 2+ teams join at once.',
  paramSchema: [
    {
      key: 'pool',
      label: 'Pool',
      type: 'enum',
      options: [
        { value: 'shared', label: 'Shared pool, alternating picks' },
        { value: 'sequential', label: 'Sequential separate drafts' },
      ],
      default: 'shared',
    },
    { key: 'firstPickRotates', label: 'First pick rotates between the new teams', type: 'boolean', default: true },
  ],
  defaultParams: { pool: 'shared', firstPickRotates: true },
  describe(p, ctx) {
    if (ctx.teamsAdded < 2) return ['(Only applies when adding 2+ teams at once — set "New teams" above 1.)']
    const lines = [
      str(p, 'pool', 'shared') === 'shared'
        ? `All ${ctx.teamsAdded} expansion teams draft from one shared unprotected pool, alternating picks.`
        : `The ${ctx.teamsAdded} expansion teams hold separate drafts in sequence, re-protecting between them.`,
    ]
    if (bool(p, 'firstPickRotates', true)) lines.push('The right to pick first rotates between the new teams each round.')
    return lines
  },
}
