// ExpansionModel (de)serialization — same defensive posture as the ruleset
// serializer: drop unknown kinds, coerce params against each rule's schema.

import { coerceParams } from '../serialize'
import type { ModuleInstance } from '../types'
import { EXPANSION_MAP } from './catalog'
import type { ExpansionModel } from './types'

export const EXPANSION_SCHEMA_VERSION = 1

export function serializeModel(m: ExpansionModel): string {
  return JSON.stringify(m, null, 2)
}

function coerceInstance(inst: ModuleInstance): ModuleInstance | null {
  const def = EXPANSION_MAP[inst.kind]
  if (!def) return null // unknown kind — drop it
  return {
    id: typeof inst.id === 'string' ? inst.id : `${inst.kind}-${Math.abs(hash(JSON.stringify(inst)))}`,
    kind: inst.kind,
    enabled: inst.enabled !== false,
    params: coerceParams(def.paramSchema, inst.params ?? {}),
  }
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

export function deserializeModel(input: string | unknown): ExpansionModel {
  const raw = (typeof input === 'string' ? JSON.parse(input) : input) as Partial<ExpansionModel>
  const modules = Array.isArray(raw.modules)
    ? raw.modules.map(coerceInstance).filter((m): m is ModuleInstance => m !== null)
    : []
  const validCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR']
  const teamsAdded =
    typeof raw.teamsAdded === 'number' && Number.isFinite(raw.teamsAdded)
      ? Math.max(1, Math.round(raw.teamsAdded))
      : 1
  return {
    schemaVersion: EXPANSION_SCHEMA_VERSION,
    id: typeof raw.id === 'string' ? raw.id : 'custom-expansion',
    name: typeof raw.name === 'string' ? raw.name : 'Custom Expansion Model',
    sport: typeof raw.sport === 'string' ? raw.sport : undefined,
    currency:
      typeof raw.currency === 'string' && validCurrencies.includes(raw.currency)
        ? (raw.currency as ExpansionModel['currency'])
        : 'USD',
    teamsAdded,
    modules,
    meta: raw.meta,
  }
}

// ─── URL-hash sharing (#x=<base64>) — parallel to the ruleset's #r= ──────────

export function encodeModelToHash(m: ExpansionModel): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(m))))
}

export function decodeModelFromHash(hash: string): ExpansionModel | null {
  try {
    return deserializeModel(decodeURIComponent(escape(atob(hash))))
  } catch {
    return null
  }
}
