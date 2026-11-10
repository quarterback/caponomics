import { coerceParams } from '../serialize'
import type { ModuleInstance } from '../types'
import { CUP_MAP } from './catalog'
import type { CupModel } from './types'

export const CUP_SCHEMA_VERSION = 1

export function serializeCup(m: CupModel): string {
  return JSON.stringify(m, null, 2)
}

export function deserializeCup(input: string | unknown): CupModel {
  const raw = (typeof input === 'string' ? JSON.parse(input) : input) as Partial<CupModel>
  const modules: ModuleInstance[] = Array.isArray(raw.modules)
    ? raw.modules.flatMap((inst, i) => {
        const def = CUP_MAP[inst?.kind]
        if (!def) return []
        return [
          {
            id: typeof inst.id === 'string' ? inst.id : `${inst.kind}-${i + 1}`,
            kind: inst.kind,
            enabled: inst.enabled !== false,
            params: coerceParams(def.paramSchema, inst.params ?? {}),
          },
        ]
      })
    : []
  const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR']
  return {
    schemaVersion: CUP_SCHEMA_VERSION,
    id: typeof raw.id === 'string' ? raw.id : 'custom-cup',
    name: typeof raw.name === 'string' ? raw.name : 'Custom cup',
    sport: typeof raw.sport === 'string' ? raw.sport : undefined,
    currency: typeof raw.currency === 'string' && currencies.includes(raw.currency) ? (raw.currency as CupModel['currency']) : 'USD',
    modules,
    meta: raw.meta,
  }
}

// URL-hash sharing (#c=<base64>), parallel to #r= and #x=.
export function encodeCupToHash(m: CupModel): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(m))))
}

export function decodeCupFromHash(hash: string): CupModel | null {
  try {
    return deserializeCup(decodeURIComponent(escape(atob(hash))))
  } catch {
    return null
  }
}
