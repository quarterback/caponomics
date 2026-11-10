import { bool, num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** NHL 2021's novel lever: Seattle could court unprotected pending free agents
 *  before the draft, with a signing counting as that team's selection. */
export const preDraftWindow: ExpansionModuleDef = {
  kind: 'preDraftWindow',
  label: 'Free-Agent Window',
  category: 'special',
  blurb: 'The new team may sign unprotected pending free agents before the draft.',
  paramSchema: [
    { key: 'days', label: 'Window length (days)', type: 'number', default: 3, min: 1 },
    { key: 'countsAsPick', label: 'A signing counts as that team’s selection', type: 'boolean', default: true },
    { key: 'maxPerTeam', label: 'Max signings per existing team', type: 'number', default: 1, min: 0 },
  ],
  defaultParams: { days: 3, countsAsPick: true, maxPerTeam: 1 },
  describe(p) {
    const lines = [
      `For ${num(p, 'days', 3)} days before the draft, each expansion team may negotiate with and sign unprotected pending free agents. It may sign up to ${num(p, 'maxPerTeam', 1)} from each existing team.`,
    ]
    if (bool(p, 'countsAsPick', true)) lines.push('A signing counts as the expansion team’s selection from that club.')
    return lines
  },
}

/** The Vegas 2017 playbook: teams paying the expansion club to take (or avoid)
 *  a specific player. Permitted-but-optional is itself a rule choice. */
export const sideDeals: ExpansionModuleDef = {
  kind: 'sideDeals',
  label: 'Side Deals',
  category: 'special',
  blurb: 'Sets whether existing teams may pay the new team to select or pass over a player.',
  paramSchema: [{ key: 'allowed', label: 'Allow side deals', type: 'boolean', default: true }],
  defaultParams: { allowed: true },
  describe(p) {
    return bool(p, 'allowed', true)
      ? [
          'Side deals are allowed. An existing team may give the expansion team picks, players or cash to select or pass over a specific player. Teams made such deals with Vegas in 2017.',
        ]
      : ['Side deals are prohibited. No team may give the expansion team anything of value to influence its selections.']
  },
}

/** What a selection is worth as an asset afterward (MLS: picks are tradable
 *  and salaries unilaterally renegotiable; NFL: no trading a pick back). */
export const pickRights: ExpansionModuleDef = {
  kind: 'pickRights',
  label: 'Post-Pick Rights',
  category: 'special',
  blurb: 'Sets what the new team may do with a player it drafts.',
  paramSchema: [
    { key: 'tradable', label: 'Players and picks tradable', type: 'boolean', default: true },
    {
      key: 'renegotiation',
      label: 'New team may reset salary',
      type: 'boolean',
      default: false,
      help: 'MLS uses this rule. The expansion club may set a new salary for a player it drafts.',
    },
    { key: 'noTradeBack', label: 'No trade back to old team', type: 'boolean', default: false },
  ],
  defaultParams: { tradable: true, renegotiation: false, noTradeBack: false },
  describe(p) {
    const lines: string[] = []
    lines.push(
      bool(p, 'tradable', true)
        ? 'The expansion team may trade drafted players and unused picks.'
        : 'The expansion team may not trade drafted players.',
    )
    if (bool(p, 'renegotiation', false)) lines.push('The expansion team may raise or lower a drafted player’s salary without the player’s agreement.')
    if (bool(p, 'noTradeBack', false)) lines.push('A drafted player may not be traded back to the team that exposed that player.')
    return lines
  },
}

/** Freeform rule — the "add your own ideas" escape hatch, mirroring the cap
 *  side's passThrough module. */
export const houseRule: ExpansionModuleDef = {
  kind: 'houseRule',
  label: 'House Rule',
  category: 'special',
  blurb: 'Write any rule in your own words.',
  paramSchema: [
    { key: 'title', label: 'Rule name', type: 'text', default: 'House rule' },
    {
      key: 'note',
      label: 'The rule',
      type: 'text',
      default: '',
      placeholder: 'e.g. Compensation doubles each time the same team loses another player.',
    },
  ],
  defaultParams: { title: 'House rule', note: '' },
  describe(p) {
    const note = str(p, 'note', '')
    const title = str(p, 'title', 'House rule')
    return [note ? `${title}: ${note}` : `${title}: write the rule in this module’s settings.`]
  },
}
