// Counting-system presets + the charter-fit reading.
//
// Every real or proposed system is *just a preset* over the same handful of
// rule slots — that is the whole point of the tool.

import type { System } from './types'

const BASE: System = {
  id: 'portland',
  name: 'Portland 2024',
  blurb: 'Droop threshold · weighted inclusive Gregory · lowest out',
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
    label: 'Current law',
    systems: [BASE],
  },
  {
    label: 'Other STV counts',
    systems: [
      sys({ id: 'meek', name: 'Meek STV', blurb: 'Winners keep a share of every ballot; the quota falls as ballots run out', method: 'meek' }),
      sys({ id: 'warren', name: 'Warren STV', blurb: 'Like Meek, but winners take equal portions from each ballot', method: 'meek', meekVariant: 'warren' }),
      sys({
        id: 'last-parcel',
        name: 'Last-parcel Gregory',
        blurb: 'Only the ballots that tipped the winner over transfer',
        surplus: 'last-parcel',
        surplusOrder: 'largest',
        truncate: false,
      }),
    ],
  },
  {
    label: 'Majority-leaning variants',
    systems: [
      sys({ id: 'btr-wigm', name: 'BTR-WIGM', blurb: 'Bottom two face off head-to-head before anyone is cut', elimination: 'btr' }),
      sys({ id: 'stv-b', name: 'STV-B (Borda elimination)', blurb: 'Lowest Borda score is cut, not lowest tally', elimination: 'borda' }),
      sys({
        id: 'hare-mandate',
        name: 'Hare-Mandate STV',
        blurb: 'Higher threshold (⅓ for 3 seats); seats nobody reaches go to a districtwide count',
        quota: 'hare',
        completion: 'finisher',
      }),
      sys({
        id: 'two-plus-one',
        name: '2+1 Hybrid',
        blurb: 'STV fills all but one seat; the last goes to a districtwide Condorcet count',
        resetSeats: 1,
      }),
      sys({ id: 'rank-decay', name: 'Rank-decay transfers', blurb: 'A ballot keeps 80% of its value each time it moves', decay: 0.8, truncate: false }),
    ],
  },
  {
    label: 'Other methods',
    systems: [
      sys({
        id: 'mcpc',
        name: 'MCPC',
        blurb: 'Picks the committee most voters put in their top 3; every winner must clear a support bar',
        method: 'mcpc',
      }),
      sys({
        id: 'sequential',
        name: 'Sequential Mandate RCV',
        blurb: 'One instant-runoff per seat, ballots restored each time',
        resetSeats: 99,
        finisher: 'irv',
      }),
      sys({ id: 'sntv', name: 'First-choice plurality', blurb: 'Top N first choices; rankings ignored (SNTV)', method: 'sntv' }),
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
  if (s.method === 'mcpc') charter.push('Not a transferable-vote count at all — the charter names single transferable vote.')
  if (s.method === 'sntv') charter.push('Ignores rankings — the charter requires ranked choice voting.')
  if (s.method === 'meek') {
    code.push(
      'Keep-value counting still elects on a threshold, transfers surpluses and cuts the lowest candidate — arguably inside the charter, but the falling quota and transfers through winners would be a contested reading.',
    )
  }
  if (s.method === 'stv') {
    if (s.quota === 'hare' || (s.quota === 'custom' && s.quotaShare > 0.2501))
      charter.push('Raises the threshold above the lowest one that prevents too many winners (charter language).')
    if (s.quota === 'exact') code.push('Fractional Droop threshold instead of the code’s whole-number formula.')
    if (s.quotaBasis === 'stv' && s.resetSeats > 0) charter.push('Threshold no longer tied to the full number of seats.')
    if (s.elimination !== 'lowest')
      charter.push('The charter says the lowest-polling candidates are eliminated; a pairwise or Borda test picks someone else.')
    if (s.decay < 1) charter.push('Discounting transferred ballots is not a transfer “to the next-ranked candidate” at the ballot’s value.')
    if (s.resetSeats > 0) charter.push('Seats filled outside the transferable-vote count, with ballots restored to full value.')
    if (s.completion === 'finisher') charter.push('Replaces the STV count for unfilled seats with a separate contest.')
    if (s.surplus === 'none') charter.push('The charter requires surplus votes to transfer.')
    if (s.surplus === 'last-parcel') code.push('Last-parcel surplus transfers instead of the code’s all-ballot weighted transfer.')
    if (s.surplusOrder !== 'simultaneous' && s.surplus !== 'none') code.push('Surpluses transferred one at a time rather than simultaneously.')
    if (!s.truncate) code.push('Exact arithmetic instead of four-decimal truncation.')
  }
  if (charter.length) return { level: 'charter', label: 'Needs charter amendment', short: 'Charter', reasons: [...charter, ...code] }
  if (code.length) return { level: 'ordinance', label: 'Code-level change', short: 'Ordinance', reasons: code }
  return { level: 'current', label: 'Current law', short: 'Current', reasons: ['Matches City Code 2.08.030 as written (ties here are broken deterministically, not by lot).'] }
}
