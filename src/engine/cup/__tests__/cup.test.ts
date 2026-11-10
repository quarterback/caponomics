import { describe, expect, it } from 'vitest'
import { CUP_PRESETS, CUP_PRESET_MAP } from '../../../presets/cup'
import { CUP_CATALOG } from '../catalog'
import { decodeCupFromHash, deserializeCup, encodeCupToHash, serializeCup } from '../serialize'
import { cupNumbers, summarizeCup } from '../summary'

const nba = CUP_PRESET_MAP['cup-nba-2026']!
const mlb = CUP_PRESET_MAP['cup-mlb']!
const nhl = CUP_PRESET_MAP['cup-nhl']!

describe('cup arithmetic', () => {
  it('NBA Cup: 30 teams, six groups of five, eight advance, final is the only added game', () => {
    expect(cupNumbers(nba, 30)).toEqual({ field: 30, groups: 6, groupGames: 4, advancing: 8, rounds: 3, addedGames: 1 })
  })
  it('MLB Cup: three-game series in division groups, knockout games are added', () => {
    const n = cupNumbers(mlb, 30)
    expect(n.groupGames).toBe(12)
    expect(n.advancing).toBe(8)
    // best-of-3 quarterfinal + best-of-3 semifinal + one-game final
    expect(n.addedGames).toBe(7)
  })
  it('NHL Cup: 32 teams, eight groups of four, home and away, no wild cards', () => {
    expect(cupNumbers(nhl, 32)).toMatchObject({ groups: 8, groupGames: 6, advancing: 8, rounds: 3 })
  })
  it('handles a league that does not divide evenly into groups', () => {
    const s = summarizeCup(nba, 32)
    expect(s.stats.find((x) => x.label === 'Groups')!.value).toBe('6 of 5 or 6')
  })
})

describe('competitions with clubs from several leagues', () => {
  it('Leagues Cup: 36 clubs, three matches, top four of each league table advance', () => {
    expect(cupNumbers(CUP_PRESET_MAP['cup-leagues-2026']!, 30)).toMatchObject({ field: 36, groups: 2, groupGames: 3, advancing: 8, rounds: 3 })
  })
  it('Champions Cup: 27 clubs need five knockout rounds, two legs until the final', () => {
    const n = cupNumbers(CUP_PRESET_MAP['cup-concacaf-2026']!, 30)
    expect(n).toMatchObject({ field: 27, groups: null, advancing: 27, rounds: 5 })
    // three early rounds and a semifinal over two legs, then a one-match final
    expect(n.addedGames).toBe(9)
    const lines = summarizeCup(CUP_PRESET_MAP['cup-concacaf-2026']!, 30).sections.find((s) => s.category === 'knockout')!.lines.join(' ')
    expect(lines).toContain('5 teams skip the first knockout round')
    expect(lines).toContain('two legs')
  })
  it('three-tier model reports three competitions', () => {
    const s = summarizeCup(CUP_PRESET_MAP['cup-concacaf-tiers']!, 30)
    expect(s.stats.find((x) => x.label === 'Competitions')!.value).toBe('3')
  })
})

describe('cup rulebook', () => {
  it('every preset with rules renders a rulebook', () => {
    for (const p of CUP_PRESETS.filter((x) => x.modules.length)) {
      const s = summarizeCup(p, 30)
      expect(s.sections.length, p.id).toBeGreaterThan(2)
      for (const sec of s.sections) for (const line of sec.lines) expect(line.trim().length).toBeGreaterThan(0)
    }
  })
  it('every rule describes its defaults in whole sentences', () => {
    for (const def of CUP_CATALOG) {
      const lines = def.describe(def.defaultParams, { teams: 30, currency: 'USD' })
      for (const line of lines) expect(line, def.kind).toMatch(/[.:]$|\.$/)
    }
  })
  it('says which NBA Cup games count in the standings', () => {
    const lines = summarizeCup(nba, 30).sections.find((s) => s.category === 'schedule')!.lines.join(' ')
    expect(lines).toContain('group games and knockout games before the final')
    expect(lines).toContain('do not count')
  })
})

describe('cup serialization', () => {
  it('round-trips through JSON and the URL hash', () => {
    expect(deserializeCup(serializeCup(nba)).modules).toEqual(nba.modules)
    expect(decodeCupFromHash(encodeCupToHash(mlb))!.modules).toEqual(mlb.modules)
  })
  it('drops unknown rules', () => {
    const m = deserializeCup({ id: 'x', name: 'X', modules: [{ id: 'a', kind: 'nope', enabled: true, params: {} }] })
    expect(m.modules).toEqual([])
  })
})
