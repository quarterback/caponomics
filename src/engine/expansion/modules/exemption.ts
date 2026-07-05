import { bool, num, str } from '../../params'
import type { ExpansionModuleDef } from '../types'

/** Young players are invisible to the draft (NHL: 1st/2nd-year pros; NFL:
 *  fewer than 3 accrued seasons). They can't be picked and don't need slots. */
export const youngPlayerExemption: ExpansionModuleDef = {
  kind: 'youngPlayerExemption',
  label: 'Young-Player Exemption',
  category: 'exemption',
  blurb: 'Players under a service-time threshold are exempt — unpickable and slot-free.',
  paramSchema: [
    { key: 'maxYears', label: 'Max pro seasons to qualify', type: 'number', default: 2, min: 0 },
    { key: 'unsignedPicks', label: 'Unsigned draft picks also exempt', type: 'boolean', default: true },
  ],
  defaultParams: { maxYears: 2, unsignedPicks: true },
  describe(p) {
    const lines = [
      `Players with ${num(p, 'maxYears', 2)} or fewer professional seasons are exempt — they can't be selected and don't consume protection slots.`,
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
  blurb: 'A described class of players is automatically protected.',
  paramSchema: [
    {
      key: 'criteria',
      label: 'Who qualifies',
      type: 'text',
      default: 'Homegrown players aged 25 or younger',
      placeholder: 'e.g. academy graduates, designated youth players…',
    },
    { key: 'consumesSlot', label: 'Consumes a protection slot', type: 'boolean', default: false },
  ],
  defaultParams: { criteria: 'Homegrown players aged 25 or younger', consumesSlot: false },
  describe(p) {
    return [
      `${str(p, 'criteria', 'Qualifying players')} are automatically protected` +
        (bool(p, 'consumesSlot', false) ? ', consuming a protection slot.' : ' without consuming a protection slot.'),
    ]
  },
}

/** Long-term injury exemption (NHL 2021: 60+ consecutive games missed with a
 *  potentially career-threatening injury, league approval required). */
export const injuryExemption: ExpansionModuleDef = {
  kind: 'injuryExemption',
  label: 'Injury Exemption',
  category: 'exemption',
  blurb: 'Long-term injured players may be exempted from exposure.',
  paramSchema: [
    { key: 'gamesMissed', label: 'Consecutive games missed', type: 'number', default: 60, min: 0 },
    { key: 'needsApproval', label: 'Requires league approval', type: 'boolean', default: true },
  ],
  defaultParams: { gamesMissed: 60, needsApproval: true },
  describe(p) {
    return [
      `A player who has missed ${num(p, 'gamesMissed', 60)}+ consecutive games with a potentially career-threatening injury may be exempted` +
        (bool(p, 'needsApproval', true) ? ', subject to league approval.' : '.'),
    ]
  },
}
