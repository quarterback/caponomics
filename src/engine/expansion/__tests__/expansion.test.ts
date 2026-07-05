import { describe, it, expect } from 'vitest'
import { EXPANSION_CATALOG, EXPANSION_MAP, makeExpansionInstance } from '../catalog'
import { deserializeModel, serializeModel, encodeModelToHash, decodeModelFromHash } from '../serialize'
import { summarizeModel } from '../summary'
import type { DescribeContext } from '../types'
import { EXPANSION_PRESETS, EXPANSION_PRESET_MAP } from '../../../presets/expansion'

const CTX: DescribeContext = { teamsAdded: 2, existingTeams: 30, currency: 'USD' }

describe('expansion catalog', () => {
  it('every rule has a unique kind and a non-empty schema-consistent default', () => {
    const kinds = new Set<string>()
    for (const def of EXPANSION_CATALOG) {
      expect(kinds.has(def.kind), `duplicate kind ${def.kind}`).toBe(false)
      kinds.add(def.kind)
      for (const field of def.paramSchema) {
        expect(
          Object.prototype.hasOwnProperty.call(def.defaultParams, field.key),
          `${def.kind}.${field.key} missing from defaults`,
        ).toBe(true)
      }
    }
  })

  it('every rule describes itself with defaults (no crashes, no empty output)', () => {
    for (const def of EXPANSION_CATALOG) {
      const inst = makeExpansionInstance(def.kind, '1')!
      const lines = def.describe(inst.params, CTX)
      expect(lines.length, `${def.kind} produced no lines`).toBeGreaterThan(0)
      for (const line of lines) expect(typeof line).toBe('string')
    }
  })

  it('makeExpansionInstance deep-copies defaults', () => {
    const a = makeExpansionInstance('protectionScheme', 'a')!
    const b = makeExpansionInstance('protectionScheme', 'b')!
    ;(a.params.slotsA as { count: number }[])[0]!.count = 99
    expect((b.params.slotsA as { count: number }[])[0]!.count).toBe(7)
  })
})

describe('expansion presets', () => {
  it('every preset module kind exists in the catalog', () => {
    for (const p of EXPANSION_PRESETS) {
      for (const m of p.modules) {
        expect(EXPANSION_MAP[m.kind], `${p.id} uses unknown kind ${m.kind}`).toBeDefined()
      }
    }
  })

  it('presets survive a serialize → deserialize round-trip intact', () => {
    for (const p of EXPANSION_PRESETS) {
      const back = deserializeModel(serializeModel(p))
      expect(back).toEqual(p)
    }
  })

  it('the Kraken preset summarizes into a full rulebook', () => {
    const kraken = EXPANSION_PRESET_MAP['exp-nhl-2021']!
    const s = summarizeModel(kraken, 32)
    const categories = s.sections.map((x) => x.category)
    expect(categories).toContain('protection')
    expect(categories).toContain('exposure')
    expect(categories).toContain('financial')
    const all = s.sections.flatMap((x) => x.lines).join(' ')
    expect(all).toMatch(/7 F \/ 3 D \/ 1 G/)
    expect(all).toMatch(/60% and 100%/)
    // Quick math sees the loaded league.
    expect(all).toMatch(/32 existing teams/)
    expect(s.stats.find((x) => x.label === 'Protected / team')?.value).toBe('11 or 9')
  })

  it('the two-team WNBA preset reads as a shared-pool draft', () => {
    const w = EXPANSION_PRESET_MAP['exp-wnba-2026']!
    expect(w.teamsAdded).toBe(2)
    const all = summarizeModel(w, 13).sections.flatMap((x) => x.lines).join(' ')
    expect(all).toMatch(/shared unprotected pool/)
    expect(all).toMatch(/2 rounds/)
  })
})

describe('expansion serialization defenses', () => {
  it('drops unknown kinds and coerces bad params', () => {
    const m = deserializeModel({
      name: 'hacked',
      teamsAdded: -3,
      modules: [
        { id: 'x', kind: 'notARealRule', enabled: true, params: {} },
        { id: 'y', kind: 'lossLimit', enabled: true, params: { maxLost: 'two', elimination: 1 } },
      ],
    })
    expect(m.teamsAdded).toBe(1) // clamped
    expect(m.modules).toHaveLength(1)
    expect(m.modules[0]!.params.maxLost).toBe(2) // schema default
    expect(m.modules[0]!.params.elimination).toBe(false)
  })

  it('hash encode/decode round-trips', () => {
    const kraken = EXPANSION_PRESET_MAP['exp-nhl-2021']!
    expect(decodeModelFromHash(encodeModelToHash(kraken))).toEqual(kraken)
    expect(decodeModelFromHash('%%%not-base64%%%')).toBeNull()
  })
})
