import { describe, expect, it } from 'vitest'
import { runCount } from '../count'
import { computeMetrics } from '../metrics'
import { PROFILES, generateProfile, DEFAULT_GEN, parseBallots, formatBallots } from '../profiles'
import { SYSTEMS, charterFit } from '../systems'
import type { Profile, System } from '../types'

const P = (id: string): Profile => PROFILES.find((p) => p.id === id)!
const S = (id: string): System => SYSTEMS.find((s) => s.id === id)!
const winners = (p: string, s: string, seats = P(p).seats) =>
  runCount(P(p), S(s), seats)
    .winners.map((w) => w.id)
    .sort()

describe('Portland WIGM', () => {
  it('uses the Droop threshold and elects D on full-value transfers', () => {
    const r = runCount(P('rank-decay'), S('portland'), 3)
    expect(r.quota).toBe(26)
    expect(r.winners.map((w) => w.id).sort()).toEqual(['Abara', 'Belmonte', 'Dravik'])
    expect(r.winners.every((w) => w.how === 'quota')).toBe(true)
  })
  it('splits 60/40 two seats to one', () => {
    expect(winners('sixty-forty', 'portland')).toEqual(['Abara', 'Belmonte', 'Dravik'])
  })
  it('conserves vote value', () => {
    const r = runCount(P('free-radicals'), S('portland'), 3)
    const last = r.rounds[r.rounds.length - 1]!
    const held = Object.entries(last.tallies).reduce((s, [, v]) => s + v, 0)
    // tallies at the start of the last round + what had already left the count
    expect(held + last.exhausted + last.lost).toBeGreaterThan(r.total - 1)
    expect(r.winners).toHaveLength(3)
  })
  it('lets a truncating majority lose two of three seats, below threshold', () => {
    const r = runCount(P('truncated-majority'), S('portland'), 3)
    expect(r.winners.map((w) => w.id).sort()).toEqual(['Abara', 'Fontaine', 'Galloway'])
    expect(r.winners.filter((w) => w.how === 'remaining').length).toBeGreaterThan(0)
  })
})

describe('variants', () => {
  it('rank decay flips the last seat to C and destroys 4.2 votes', () => {
    const r = runCount(P('rank-decay'), S('rank-decay'), 3)
    expect(r.winners.map((w) => w.id).sort()).toEqual(['Abara', 'Belmonte', 'Castellan'])
    expect(r.lost).toBeCloseTo(4.2, 6)
  })
  it('BTR protects the head-to-head winner in a center squeeze', () => {
    expect(winners('center-squeeze', 'portland')).toEqual(['Lindqvist'])
    expect(winners('center-squeeze', 'btr-wigm')).toEqual(['Castellan'])
  })
  it('Meek and Warren agree with WIGM on the simple cases', () => {
    for (const s of ['meek', 'warren']) {
      expect(winners('sixty-forty', s)).toEqual(['Abara', 'Belmonte', 'Dravik'])
      expect(winners('rank-decay', s)).toEqual(['Abara', 'Belmonte', 'Dravik'])
    }
  })
  it('sequential RCV hands a cohesive majority every seat', () => {
    expect(winners('sixty-forty', 'sequential')).toEqual(['Abara', 'Belmonte', 'Castellan'])
  })
  it('MCPC moves from 2–1 to a sweep as the mandate rises to a majority', () => {
    expect(winners('sixty-forty', 'mcpc')).toEqual(['Abara', 'Belmonte', 'Dravik'])
    const half = { ...S('mcpc'), mandate: 0.5 }
    expect(runCount(P('sixty-forty'), half, 3).winners.map((w) => w.id).sort()).toEqual(['Abara', 'Belmonte', 'Castellan'])
  })
  it('MCPC relaxes an infeasible mandate and says so', () => {
    const r = runCount(P('rank-decay'), { ...S('mcpc'), mandate: 0.5 }, 3)
    expect(r.winners).toHaveLength(3)
    expect(r.notes.join(' ')).toMatch(/lowered/)
  })
  it('every preset fills every seat on every profile', () => {
    for (const p of PROFILES) for (const s of SYSTEMS) expect(runCount(p, s, p.seats).winners, `${s.id} on ${p.id}`).toHaveLength(p.seats)
  })
})

describe('supporting pieces', () => {
  it('generator is seed-deterministic', () => {
    const a = generateProfile(DEFAULT_GEN)
    const b = generateProfile(DEFAULT_GEN)
    expect(a.ballots).toEqual(b.ballots)
    expect(a.ballots.reduce((s, x) => s + x.n, 0)).toBe(DEFAULT_GEN.voters)
  })
  it('ballot text round-trips', () => {
    const p = P('sixty-forty')
    const back = parseBallots(formatBallots(p))
    expect(back.ballots).toEqual(p.ballots)
    expect(back.candidates).toEqual(p.candidates)
  })
  it('flags pairwise upsets and camp seat shares', () => {
    const m = computeMetrics(P('rank-decay'), runCount(P('rank-decay'), S('rank-decay'), 3))
    expect(m.upsets.some((u) => u.loser === 'Dravik' && u.winner === 'Castellan')).toBe(true)
    const t = computeMetrics(P('truncated-majority'), runCount(P('truncated-majority'), S('portland'), 3))
    expect(t.camps[0]).toMatchObject({ camp: 'Majority', seats: 1 })
  })
  it('reads charter fit', () => {
    expect(charterFit(S('portland')).level).toBe('current')
    expect(charterFit(S('last-parcel')).level).toBe('ordinance')
    expect(charterFit(S('btr-wigm')).level).toBe('charter')
    expect(charterFit(S('hare-mandate')).level).toBe('charter')
  })
})
