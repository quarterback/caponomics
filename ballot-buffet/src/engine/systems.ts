// Counting-system presets + the charter-fit reading.
//
// Every real or proposed system is *just a preset* over the same handful of
// rule slots — that is the whole point of the tool.

import type { System } from './types'

const BASE: System = {
  id: 'portland',
  name: 'Portland 2024',
  blurb: 'The count Portland used in 2024.',
  method: 'stv',
  quota: 'droop',
  quotaShare: 1 / 3,
  quotaBasis: 'all',
  surplus: 'wigm',
  surplusOrder: 'simultaneous',
  truncate: true,
  elimination: 'lowest',
  decay: 1,
  completion: 'elect-remaining',
  resetSeats: 0,
  finisher: 'condorcet',
  meekVariant: 'meek',
  consentDepth: 3,
  mandate: 1 / 3,
}

const sys = (over: Partial<System> & Pick<System, 'id' | 'name' | 'blurb'>): System => ({ ...BASE, ...over })

export interface SystemGroup {
  label: string
  systems: System[]
}

export const SYSTEM_GROUPS: SystemGroup[] = [
  {
    label: 'Portland’s current count',
    systems: [BASE],
  },
  {
    label: 'Other ways to count STV',
    systems: [
      sys({ id: 'meek', name: 'Meek STV', blurb: 'Winners keep the same share of every ballot. The threshold falls as ballots run out.', method: 'meek' }),
      sys({ id: 'warren', name: 'Warren STV', blurb: 'Winners take the same amount from every ballot.', method: 'meek', meekVariant: 'warren' }),
      sys({
        id: 'last-parcel',
        name: 'Last-parcel Gregory',
        blurb: 'Only the last group of ballots a winner received moves on.',
        surplus: 'last-parcel',
        surplusOrder: 'largest',
        truncate: false,
      }),
    ],
  },
  {
    label: 'Changes that favor a majority',
    systems: [
      sys({ id: 'btr-wigm', name: 'BTR-WIGM', blurb: 'Compares the two lowest candidates before it removes one.', elimination: 'btr' }),
      sys({ id: 'stv-b', name: 'STV-B (Borda elimination)', blurb: 'Removes the candidate voters rank lowest overall.', elimination: 'borda' }),
      sys({
        id: 'hare-mandate',
        name: 'Hare-Mandate STV',
        blurb: 'Raises the threshold to one-third. A separate count fills seats no one reaches.',
        quota: 'hare',
        completion: 'finisher',
      }),
      sys({
        id: 'two-plus-one',
        name: '2+1 Hybrid',
        blurb: 'STV fills all seats but one. A districtwide count fills the last.',
        resetSeats: 1,
      }),
      sys({ id: 'rank-decay', name: 'Rank-decay transfers', blurb: 'A ballot loses 20% of its value each time it moves.', decay: 0.8, truncate: false }),
    ],
  },
  {
    label: 'Methods that are not STV',
    systems: [
      sys({
        id: 'mcpc',
        name: 'MCPC',
        blurb: 'Picks the group of winners that the most voters ranked in their top three.',
        method: 'mcpc',
      }),
      sys({
        id: 'sequential',
        name: 'Sequential Mandate RCV',
        blurb: 'Holds a separate instant-runoff count for each seat.',
        resetSeats: 99,
        finisher: 'irv',
      }),
      sys({ id: 'sntv', name: 'First-choice plurality', blurb: 'The candidates with the most first choices win.', method: 'sntv' }),
    ],
  },
]

export const SYSTEMS: System[] = SYSTEM_GROUPS.flatMap((g) => g.systems)
export const PORTLAND = BASE

// ───────────────────────── charter fit ─────────────────────────
//
// A *reading*, not legal advice. Portland Charter §3-102 fixes: single
// transferable vote; a threshold tied to the number of seats (the lowest that
// can't elect too many); surplus votes transferring to next-ranked candidates;
// and successive elimination of the lowest-polling candidates. City Code
// 2.08.030 — changeable by Council ordinance — holds the arithmetic: the exact
// Droop formula, weighted-inclusive transfer values truncated to four decimals,
// simultaneous surpluses, ties by lot, and the last-candidates-standing rule.

export type FitLevel = 'current' | 'ordinance' | 'charter'

export interface Fit {
  level: FitLevel
  label: string
  short: string
  reasons: string[]
}

export function charterFit(s: System): Fit {
  const charter: string[] = []
  const code: string[] = []
  if (s.method === 'mcpc') charter.push('The charter requires single transferable vote. This method does not transfer votes.')
  if (s.method === 'sntv') charter.push('The charter requires ranked choice voting. This method ignores rankings.')
  if (s.method === 'meek') {
    code.push(
      'This method still uses a threshold, moves extra votes and removes the lowest candidate. The charter may allow it, but the falling threshold would likely be disputed.',
    )
  }
  if (s.method === 'stv') {
    if (s.quota === 'hare' || (s.quota === 'custom' && s.quotaShare > 0.2501))
      charter.push('The charter ties the threshold to the number of seats. This rule sets it higher.')
    if (s.quota === 'exact') code.push('The code rounds the threshold to a whole number. This rule does not.')
    if (s.quotaBasis === 'stv' && s.resetSeats > 0) charter.push('The charter ties the threshold to the number of seats in the district. This rule uses fewer seats.')
    if (s.elimination !== 'lowest')
      charter.push('The charter removes the candidate with the fewest votes. This rule can remove a different candidate.')
    if (s.decay < 1) charter.push('The charter moves a ballot to its next choice. This rule discards part of the ballot.')
    if (s.resetSeats > 0) charter.push('The charter fills council seats by single transferable vote. This rule fills some seats with a separate count.')
    if (s.completion === 'finisher') charter.push('The code elects the remaining candidates. This rule holds a separate count instead.')
    if (s.surplus === 'none') charter.push('The charter requires extra votes to move to next choices. This rule keeps them with the winner.')
    if (s.surplus === 'last-parcel') code.push('The code moves every ballot a winner holds. This rule moves only the last group.')
    if (s.surplusOrder !== 'simultaneous' && s.surplus !== 'none') code.push('The code moves all winners’ extra votes together. This rule moves them one winner at a time.')
    if (!s.truncate) code.push('The code cuts transfer values at four decimals. This rule does not round.')
  }
  if (charter.length) return { level: 'charter', label: 'Needs charter amendment', short: 'Charter', reasons: [...charter, ...code] }
  if (code.length) return { level: 'ordinance', label: 'Needs an ordinance', short: 'Ordinance', reasons: code }
  return { level: 'current', label: 'Current law', short: 'Current', reasons: ['This count follows City Code 2.08.030. The tool breaks ties by a fixed rule. Portland draws lots.'] }
}
