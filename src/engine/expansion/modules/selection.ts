import { bool, num, objList, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** How many players a new team takes from each existing team (NHL/WNBA:
 *  exactly 1; NBA/MLS: at most 1). */
export const selectionQuota: ExpansionModuleDef = {
  kind: 'selectionQuota',
  label: 'Selection Quota',
  category: 'selection',
  blurb: 'How many players each new team selects per existing team.',
  paramSchema: [
    {
      key: 'perTeam',
      label: 'Per existing team',
      type: 'enum',
      options: [
        { value: 'exactly', label: 'Exactly' },
        { value: 'atMost', label: 'At most' },
      ],
      default: 'exactly',
    },
    { key: 'count', label: 'Selections per team (per round)', type: 'number', default: 1, min: 0 },
  ],
  defaultParams: { perTeam: 'exactly', count: 1 },
  describe(p, ctx) {
    const word = str(p, 'perTeam', 'exactly') === 'exactly' ? 'exactly' : 'at most'
    const count = num(p, 'count', 1)
    const lines = [
      `Each expansion team selects ${word} ${count} player${count === 1 ? '' : 's'} from each existing team per round.`,
    ]
    if (ctx.existingTeams !== null) {
      const total = ctx.existingTeams * count
      lines.push(
        `Against the loaded league (${ctx.existingTeams} existing teams) that is ${word === 'exactly' ? '' : 'up to '}${total} selections per expansion team per round.`,
      )
    }
    return lines
  },
}

/** Total-loss protection for incumbents (WNBA 2026: no team loses more than 2;
 *  MLS: a team leaves the pool the moment it loses one). */
export const lossLimit: ExpansionModuleDef = {
  kind: 'lossLimit',
  label: 'Loss Limit',
  category: 'selection',
  blurb: 'Caps how many players any one existing team can lose in total.',
  paramSchema: [
    { key: 'maxLost', label: 'Max players lost per team', type: 'number', default: 2, min: 0 },
    {
      key: 'elimination',
      label: 'Team exits pool after any loss',
      type: 'boolean',
      default: false,
      help: 'The MLS mechanic: once tapped, a club can’t be picked from again.',
    },
  ],
  defaultParams: { maxLost: 2, elimination: false },
  describe(p) {
    const lines = [`No existing team loses more than ${num(p, 'maxLost', 2)} player(s) across the entire draft.`]
    if (bool(p, 'elimination', false)) lines.push('Once a team loses a player, it is removed from the pool entirely.')
    return lines
  },
}

/** NFL 2002 pull-backs: losing a player buys you extra mid-draft protection. */
export const pullback: ExpansionModuleDef = {
  kind: 'pullback',
  label: 'Pull-Back Rights',
  category: 'selection',
  blurb: 'After losing players, a team may pull names back off the exposure list.',
  paramSchema: [
    { key: 'afterFirst', label: 'Names pulled back after 1st loss', type: 'number', default: 1, min: 0 },
    { key: 'allAfterSecond', label: 'Pull back everyone after 2nd loss', type: 'boolean', default: true },
  ],
  defaultParams: { afterFirst: 1, allAfterSecond: true },
  describe(p) {
    const lines: string[] = []
    const n = num(p, 'afterFirst', 1)
    if (n > 0) lines.push(`After a team loses its first player, it may pull ${n} name${n === 1 ? '' : 's'} back off its exposure list.`)
    if (bool(p, 'allAfterSecond', true)) lines.push('After a second loss, it may pull back all remaining exposed players (pulling back is optional).')
    return lines.length ? lines : ['Pull-backs configured to zero — losses buy no extra protection.']
  },
}

/** What the finished expansion roster must look like (NHL: exactly 30 picks
 *  landing 14 F / 9 D / 3 G with 20+ under contract; NBA: between 14 and 29). */
export const rosterTargets: ExpansionModuleDef = {
  kind: 'rosterTargets',
  label: 'Expansion Roster Targets',
  category: 'selection',
  blurb: 'Size and positional requirements for what the new team drafts.',
  paramSchema: [
    { key: 'minSize', label: 'Min total selections', type: 'number', default: 14, min: 0 },
    { key: 'maxSize', label: 'Max total selections', type: 'number', default: 30, min: 0 },
    {
      key: 'positionalMins',
      label: 'Positional minimums',
      type: 'bracketList',
      itemSchema: [
        { key: 'pos', label: 'Position', type: 'text', default: 'F' },
        { key: 'count', label: 'Min', type: 'number', default: 1, min: 0 },
      ],
      default: [],
    },
    { key: 'minUnderContract', label: 'Min already under contract (0 = off)', type: 'number', default: 0, min: 0 },
  ],
  defaultParams: { minSize: 14, maxSize: 30, positionalMins: [], minUnderContract: 0 },
  describe(p) {
    const min = num(p, 'minSize', 0)
    const max = num(p, 'maxSize', 0)
    const lines = [
      min === max
        ? `Each expansion team makes exactly ${min} selections.`
        : `Each expansion team makes between ${min} and ${max} selections.`,
    ]
    const mins = objList(p, 'positionalMins').map((r) => `${num(r, 'count', 0)} ${str(r, 'pos', '?')}`)
    if (mins.length) lines.push(`The drafted roster must include at least ${mins.join(', ')}.`)
    const uc = num(p, 'minUnderContract', 0)
    if (uc > 0) lines.push(`At least ${uc} selections must be under contract for next season.`)
    return lines
  },
}

/** Status-based pick rules (WNBA 2024: max one UFA and no long-tenured Core
 *  players; NBA: a drafted pending RFA instantly becomes a UFA). */
export const specialStatusRules: ExpansionModuleDef = {
  kind: 'specialStatusRules',
  label: 'Special-Status Rules',
  category: 'selection',
  blurb: 'Caps and conversions tied to contract status (UFAs, core/franchise tags…).',
  paramSchema: [
    { key: 'maxSpecial', label: 'Max picks of the capped status (0 = off)', type: 'number', default: 1, min: 0 },
    { key: 'cappedStatus', label: 'Capped status', type: 'text', default: 'pending unrestricted free agent' },
    {
      key: 'offLimits',
      label: 'Off-limits entirely (blank = none)',
      type: 'text',
      default: '',
      placeholder: 'e.g. players on a Core contract for 2+ seasons',
    },
    {
      key: 'conversion',
      label: 'Status conversion on selection (blank = none)',
      type: 'text',
      default: '',
      placeholder: 'e.g. a selected pending RFA immediately becomes a UFA',
    },
  ],
  defaultParams: { maxSpecial: 1, cappedStatus: 'pending unrestricted free agent', offLimits: '', conversion: '' },
  describe(p) {
    const lines: string[] = []
    const cap = num(p, 'maxSpecial', 0)
    if (cap > 0) lines.push(`Each expansion team may select at most ${cap} ${str(p, 'cappedStatus', 'special-status')} player${cap === 1 ? '' : 's'} in total.`)
    const off = str(p, 'offLimits', '')
    if (off) lines.push(`Off-limits entirely: ${off}.`)
    const conv = str(p, 'conversion', '')
    if (conv) lines.push(`On selection: ${conv}.`)
    return lines.length ? lines : ['No special-status rules configured.']
  },
}
