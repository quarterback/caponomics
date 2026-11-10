import { describe, expect, it } from 'vitest'
import { runCount } from '../count'
import { DEFAULT_GEN, PROFILES, formatBallots, generateProfile, parseBallots } from '../profiles'
import { SYSTEMS } from '../systems'
import type { Profile, System } from '../types'

const TRV = SYSTEMS.find((s) => s.id === 'trv')!
const at = (over: Partial<System>): System => ({ ...TRV, ...over })
const profile = (text: string, seats: number): Profile => {
  const { candidates, ballots, errors } = parseBallots(text)
  expect(errors).toEqual([])
  return { id: 'x', name: 'x', blurb: '', seats, candidates, ballots }
}
const winners = (p: Profile, s: System) =>
  runCount(p, s, p.seats)
    .winners.map((w) => w.id)
    .sort()

// The worked examples in Bewley and Luchini (2025), section 2.1. Approval is 5, no approval is 0.
describe('TRV reproduces the paper', () => {
  it('Example 1 (approval): a third of voters who approve only d get d elected', () => {
    const p = profile(`1: a=5
1: a=5, b=5
4: a=5, b=5, c=5
3: d=5`, 3)
    expect(winners(p, TRV)).toEqual(['a', 'b', 'd'])
  })
  it('Example 2a (approval): when d’s voters also approve c, the result is a, b, c', () => {
    const p = profile(`1: a=5
1: a=5, b=5
4: a=5, b=5, c=5
3: c=5, d=5`, 3)
    expect(winners(p, TRV)).toEqual(['a', 'b', 'c'])
  })
  it('Example 2b (approval): one voter dropping c changes the result to a, c, d', () => {
    const p = profile(`1: a=5
1: a=5, b=5
4: a=5, b=5, c=5
1: d=5
2: c=5, d=5`, 3)
    expect(winners(p, TRV)).toEqual(['a', 'c', 'd'])
  })
  it('Example 3a (scores): two seats go to a and b', () => {
    const p = PROFILES.find((x) => x.id === 'trv-paper')!
    expect(winners(p, TRV)).toEqual(['Abara', 'Belmonte'])
  })
  it('Example 3b (scores): voter 7 dropping a weak score for a gives a and c', () => {
    const p = profile(`1: a=5
2: a=5, b=2.5
3: b=5, a=2.5
3: c=5`, 2)
    expect(winners(p, TRV)).toEqual(['a', 'c'])
  })
})

describe('TRV behaviour', () => {
  const sixty = profile(`60: A=5, B=4, C=3
40: D=5, E=4, F=3`, 3)
  it('at C = 1 a 60/40 electorate splits the seats two to one', () => {
    expect(winners(sixty, TRV)).toEqual(['A', 'B', 'D'])
  })
  it('at C = seats it is plain score voting (Lemma 2)', () => {
    // Score totals after rescaling: A 60, B 48, D 40, C 36. The majority's weak third choice loses to D.
    expect(winners(sixty, at({ trvC: 3 }))).toEqual(['A', 'B', 'D'])
    // A majority that rates all three of its candidates highly takes every seat.
    const solid = profile(`60: A=5, B=5, C=5
40: D=5, E=5, F=5`, 3)
    expect(winners(solid, TRV)).toEqual(['A', 'B', 'D'])
    expect(winners(solid, at({ trvC: 3 }))).toEqual(['A', 'B', 'C'])
  })
  it('a seat costs about a third of the currency, and less when some goes unspent', () => {
    const r = runCount(sixty, TRV, 3)
    expect(r.quota!).toBeLessThanOrEqual(100 / 3 + 1e-6)
    expect(r.quota!).toBeGreaterThan(25)
  })
  it('a backup scored low offers only its score', () => {
    // 51 voters: A first, B a weak backup. 49 voters: C only. One seat.
    const p = profile(`51: A=5, B=1
49: C=5`, 1)
    const r = runCount(p, at({ trvRescale: false }), 1)
    expect(r.rounds[0]!.tallies.B).toBeCloseTo(51 * 0.2, 6)
  })
  it('ranked ballots are converted, and the result says so', () => {
    const p = PROFILES.find((x) => x.id === 'sixty-forty')!
    const r = runCount(p, TRV, 3)
    expect(r.winners).toHaveLength(3)
    expect(r.notes.join(' ')).toMatch(/rankings, not scores/)
  })
  it('generated districts carry score ballots that agree with the rankings', () => {
    const g = generateProfile(DEFAULT_GEN)
    for (const b of g.ballots.slice(0, 200)) {
      expect(b.scores![b.ranks[0]!]).toBe(5)
      for (let i = 1; i < b.ranks.length; i++) expect(b.scores![b.ranks[i]!] ?? 0).toBeLessThanOrEqual(b.scores![b.ranks[i - 1]!] ?? 0)
    }
    expect(runCount(g, TRV, 3).winners).toHaveLength(3)
  })
  it('score ballots round-trip through the text format', () => {
    const p = PROFILES.find((x) => x.id === 'trv-paper')!
    const back = parseBallots(formatBallots(p))
    expect(back.ballots.map((b) => [b.n, b.scores])).toEqual(p.ballots.map((b) => [b.n, b.scores]))
  })
})
