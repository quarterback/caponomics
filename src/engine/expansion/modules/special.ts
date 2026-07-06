import { bool, num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** NHL 2021's novel lever: Seattle could court unprotected pending free agents
 *  before the draft, with a signing counting as that team's selection. */
export const preDraftWindow: ExpansionModuleDef = {
  kind: 'preDraftWindow',
  label: 'Pre-Draft FA Window',
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
      `For ${num(p, 'days', 3)} days before the draft, each expansion team may negotiate with and sign unprotected pending free agents (up to ${num(p, 'maxPerTeam', 1)} per existing team).`,
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
  blurb: 'May existing teams pay the new team to steer its selections?',
  paramSchema: [{ key: 'allowed', label: 'Side deals permitted', type: 'boolean', default: true }],
  defaultParams: { allowed: true },
  describe(p) {
    return bool(p, 'allowed', true)
      ? [
          'Side deals are permitted: existing teams may send picks, players, or cash to steer the expansion team toward — or away from — specific selections (the Vegas 2017 playbook).',
        ]
      : ['Side deals are prohibited: no consideration may change hands to influence selections.']
  },
}

/** What a selection is worth as an asset afterward (MLS: picks are tradable
 *  and salaries unilaterally renegotiable; NFL: no trading a pick back). */
export const pickRights: ExpansionModuleDef = {
  kind: 'pickRights',
  label: 'Post-Pick Rights',
  category: 'special',
  blurb: 'What the new team may do with a drafted player afterward.',
  paramSchema: [
    { key: 'tradable', label: 'Drafted players/picks are tradable', type: 'boolean', default: true },
    {
      key: 'renegotiation',
      label: 'Salary unilaterally renegotiable',
      type: 'boolean',
      default: false,
      help: 'The MLS rule: the expansion club may re-set a drafted player’s salary.',
    },
    { key: 'noTradeBack', label: 'No trading a player back to his old team', type: 'boolean', default: false },
  ],
  defaultParams: { tradable: true, renegotiation: false, noTradeBack: false },
  describe(p) {
    const lines: string[] = []
    lines.push(
      bool(p, 'tradable', true)
        ? 'Drafted players (and unspent picks) are tradable assets.'
        : 'Drafted players may not be flipped — selections are keeps.',
    )
    if (bool(p, 'renegotiation', false)) lines.push('The expansion team may unilaterally renegotiate a drafted player’s salary, up or down.')
    if (bool(p, 'noTradeBack', false)) lines.push('A drafted player may not be traded back to the team that exposed him.')
    return lines
  },
}

/** Freeform rule — the "add your own ideas" escape hatch, mirroring the cap
 *  side's passThrough module. */
export const houseRule: ExpansionModuleDef = {
  kind: 'houseRule',
  label: 'House Rule',
  category: 'special',
  blurb: 'Write any rule in plain language.',
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
    return [note ? `${title}: ${note}` : `${title}: (write the rule in the module’s settings).`]
  },
}
