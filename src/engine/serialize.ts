// Ruleset (de)serialization. A Ruleset is plain JSON, so serialize is trivial;
// deserialize is where we defend against hand-edited / older / foreign files:
// drop unknown module kinds and coerce each params object against its schema
// (backfill missing keys from defaults, drop unknown keys).

import { MODULE_MAP } from './catalog'
import type { ParamField } from './module'
import type { ModuleInstance, Ruleset } from './types'

export const SCHEMA_VERSION = 1

export function serializeRuleset(r: Ruleset): string {
  return JSON.stringify(r, null, 2)
}

function coerceField(field: ParamField, value: unknown): unknown {
  switch (field.type) {
    case 'text':
      return typeof value === 'string' ? value : field.default
    case 'money':
    case 'number':
    case 'percent':
      return typeof value === 'number' && Number.isFinite(value) ? value : field.default
    case 'boolean':
      return typeof value === 'boolean' ? value : field.default
    case 'enum':
      return typeof value === 'string' && field.options.some((o) => o.value === value)
        ? value
        : field.default
    case 'enumMulti':
      return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : field.default
    case 'bracketList':
      if (!Array.isArray(value)) return structuredClone(field.default)
      return value.map((row) => coerceParams(field.itemSchema, (row ?? {}) as Record<string, unknown>))
  }
}

export function coerceParams(schema: ParamField[], params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of schema) out[field.key] = coerceField(field, params[field.key])
  return out
}

function coerceInstance(inst: ModuleInstance): ModuleInstance | null {
  const def = MODULE_MAP[inst.kind]
  if (!def) return null // unknown kind — drop it
  return {
    id: typeof inst.id === 'string' ? inst.id : `${inst.kind}-${Math.abs(hash(JSON.stringify(inst)))}`,
    kind: inst.kind,
    enabled: inst.enabled !== false,
    params: coerceParams(def.paramSchema, inst.params ?? {}),
  }
}

// Deterministic small hash (avoids Math.random for stable ids).
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

export function deserializeRuleset(input: string | unknown): Ruleset {
  const raw = (typeof input === 'string' ? JSON.parse(input) : input) as Partial<Ruleset>
  const modules = Array.isArray(raw.modules)
    ? raw.modules.map(coerceInstance).filter((m): m is ModuleInstance => m !== null)
    : []
  const validCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR']
  return {
    schemaVersion: SCHEMA_VERSION,
    id: typeof raw.id === 'string' ? raw.id : 'custom',
    name: typeof raw.name === 'string' ? raw.name : 'Custom Ruleset',
    sport: typeof raw.sport === 'string' ? raw.sport : undefined,
    currency: typeof raw.currency === 'string' && validCurrencies.includes(raw.currency) ? raw.currency : 'USD',
    seasonYears: Array.isArray(raw.seasonYears) && raw.seasonYears.length
      ? raw.seasonYears.filter((y): y is number => typeof y === 'number')
      : [2026],
    modules,
    meta: raw.meta,
  }
}

// ─── URL-hash sharing (base64 of the JSON) ──────────────────────────────────

export function encodeRulesetToHash(r: Ruleset): string {
  const json = JSON.stringify(r)
  // Unicode-safe base64.
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64
}

export function decodeRulesetFromHash(hash: string): Ruleset | null {
  try {
    const json = decodeURIComponent(escape(atob(hash)))
    return deserializeRuleset(json)
  } catch {
    return null
  }
}
