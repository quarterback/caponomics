import { describe, it, expect } from 'vitest'
import { deserializeRuleset, serializeRuleset, coerceParams, encodeRulesetToHash, decodeRulesetFromHash } from '../serialize'
import { MODULE_MAP } from '../catalog'
import { ruleset, mod } from './helpers'

describe('serialize', () => {
  it('round-trips a ruleset through JSON', () => {
    const r = ruleset([mod('hardCap', { source: 'fixed', ceiling: 100_000_000, capMultiplePct: 100, basis: 'cap' })])
    // Fill params fully so coercion is a no-op.
    const filled = deserializeRuleset(serializeRuleset(r))
    const round = deserializeRuleset(serializeRuleset(filled))
    expect(round).toEqual(filled)
  })

  it('drops modules with an unknown kind', () => {
    const r = deserializeRuleset(JSON.stringify(ruleset([mod('notARealModule', {}), mod('hardCap', {})])))
    expect(r.modules.map((m) => m.kind)).toEqual(['hardCap'])
  })

  it('backfills missing params from defaults', () => {
    const coerced = coerceParams(MODULE_MAP['hardCap']!.paramSchema, {})
    expect(coerced['ceiling']).toBe(MODULE_MAP['hardCap']!.defaultParams['ceiling'])
    expect(coerced['source']).toBe('useCapValue')
  })

  it('drops unknown param keys and keeps known ones', () => {
    const coerced = coerceParams(MODULE_MAP['hardCap']!.paramSchema, { ceiling: 5, bogus: true })
    expect(coerced['ceiling']).toBe(5)
    expect('bogus' in coerced).toBe(false)
  })

  it('survives a URL-hash round-trip', () => {
    const r = deserializeRuleset(serializeRuleset(ruleset([mod('luxuryTax', {})])))
    const decoded = decodeRulesetFromHash(encodeRulesetToHash(r))
    expect(decoded).toEqual(r)
  })
})
