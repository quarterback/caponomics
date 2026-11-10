import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { runCount } from '../count'
import { computeMetrics } from '../metrics'
import { REAL_SETS, profileFromReal, type RealFile } from '../real'
import { SYSTEMS } from '../systems'

const load = (n: number) => {
  const set = REAL_SETS[n - 1]!
  return profileFromReal(set, JSON.parse(readFileSync(`public/${set.file}`, 'utf8')) as RealFile)
}
const portland = SYSTEMS.find((s) => s.id === 'portland')!
const system = (id: string) => SYSTEMS.find((s) => s.id === id)!

// Winners certified by Multnomah County on December 2, 2024.
const CERTIFIED: Record<number, string[]> = {
  1: ['Avalos', 'Dunphy', 'Smith'],
  2: ['Kanal', 'Pirtle-Guiney', 'Ryan'],
  3: ['Lane', 'Morillo', 'Novick'],
  4: ['Clark', 'Green', 'Zimmerman'],
}

describe('Portland 2024 cast vote records', () => {
  for (const n of [1, 2, 3, 4]) {
    it(`District ${n}: the Portland count elects the certified winners`, () => {
      const p = load(n)
      const r = runCount(p, portland, 3)
      expect(r.winners.map((w) => w.id).sort()).toEqual(CERTIFIED[n])
      // 25% of the valid ballots, plus one, fractions dropped.
      expect(r.quota).toBe(Math.floor(r.total / 4) + 1)
      // Vote value is conserved to within rounding.
      const last = r.rounds[r.rounds.length - 1]!
      const held = Object.values(last.tallies).reduce((s, v) => s + v, 0)
      expect(Math.abs(held + last.exhausted + last.lost - r.total)).toBeLessThan(5)
    })
  }
  it('District 1: bottom-two runoff seats Routh where Portland seats Dunphy', () => {
    const p = load(1)
    expect(runCount(p, system('btr-wigm'), 3).winners.map((w) => w.id).sort()).toEqual(['Avalos', 'Routh', 'Smith'])
  })
  it('District 3: every system elects the same three', () => {
    const p = load(3)
    for (const s of SYSTEMS) expect(runCount(p, s, 3).winners.map((w) => w.id).sort(), s.id).toEqual(CERTIFIED[3])
  })
  it('the last winners’ extra votes are not counted as run out', () => {
    const p = load(2)
    const r = runCount(p, portland, 3)
    const m = computeMetrics(p, r)
    expect(m.inactive).toBeLessThan(0.249)
  })
})
