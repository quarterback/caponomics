import { bool, num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** Young players are invisible to the draft (NHL: 1st/2nd-year pros; NFL:
 *  fewer than 3 accrued seasons). They can't be picked and don't need slots. */
export const youngPlayerExemption: ExpansionModuleDef = {
  kind: 'youngPlayerExemption',
  label: 'Young-Player Exemption',
  category: 'exemption',
  blurb: 'Players with few pro seasons are exempt. They cannot be selected and use no protection slot.',
  paramSchema: [
    { key: 'maxYears', label: 'Max pro seasons to qualify', type: 'number', default: 2, min: 0 },
    { key: 'unsignedPicks', label: 'Unsigned picks exempt', type: 'boolean', default: true },
  ],
  defaultParams: { maxYears: 2, unsignedPicks: true },
  describe(p) {
    const lines = [
      `Players with ${num(p, 'maxYears', 2)} or fewer professional seasons are exempt. They cannot be selected and do not use a protection slot.`,
    ]
    if (bool(p, 'unsignedPicks', true)) lines.push('Unsigned draft picks are also exempt.')
    return lines
  },
}

/** Categories of players auto-protected for free (MLS: Generation Adidas and
 *  young Homegrown players don't count against the protection list). */
export const autoProtect: ExpansionModuleDef = {
  kind: 'autoProtect',
  label: 'Auto-Protected Class',
  category: 'exemption',
  blurb: 'A group of players you describe is protected automatically.',
  paramSchema: [
    {
      key: 'criteria',
      label: 'Who qualifies',
      type: 'text',
      default: 'Homegrown players aged 25 or younger',
      placeholder: 'e.g. academy graduates, designated youth players…',
    },
    { key: 'consumesSlot', label: 'Uses a protection slot', type: 'boolean', default: false },
  ],
  defaultParams: { criteria: 'Homegrown players aged 25 or younger', consumesSlot: false },
  describe(p) {
    return [
      `${str(p, 'criteria', 'Qualifying players')} are protected automatically` +
        (bool(p, 'consumesSlot', false) ? ' and use a protection slot.' : ' and do not use a protection slot.'),
    ]
  },
}

/** Long-term injury exemption (NHL 2021: 60+ consecutive games missed with a
 *  potentially career-threatening injury, league approval required). */
export const injuryExemption: ExpansionModuleDef = {
  kind: 'injuryExemption',
  label: 'Injury Exemption',
  category: 'exemption',
  blurb: 'A player with a long-term injury may be exempt from exposure.',
  paramSchema: [
    { key: 'gamesMissed', label: 'Consecutive games missed', type: 'number', default: 60, min: 0 },
    { key: 'needsApproval', label: 'Requires league approval', type: 'boolean', default: true },
  ],
  defaultParams: { gamesMissed: 60, needsApproval: true },
  describe(p) {
    return [
      `A player who has missed ${num(p, 'gamesMissed', 60)} or more consecutive games with a potentially career-threatening injury may be exempt` +
        (bool(p, 'needsApproval', true) ? ' if the league approves.' : '.'),
    ]
  },
}
