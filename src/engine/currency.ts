// Convert a ruleset's money-typed params from one currency to another, driven by
// each module's param schema (so a $240M cap becomes the equivalent £189M rather
// than a literal £240M). Mutates the ruleset in place.
import { MODULE_MAP } from './catalog'
import { fxRate, type Currency } from './format'
import type { ParamField } from './module'
import type { Ruleset } from './types'

function convertField(field: ParamField, params: Record<string, unknown>, factor: number): void {
  if (field.type === 'money') {
    const v = params[field.key]
    if (typeof v === 'number') params[field.key] = Math.round(v * factor)
  } else if (field.type === 'bracketList') {
    const rows = params[field.key]
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (row && typeof row === 'object') {
          for (const sub of field.itemSchema) convertField(sub, row as Record<string, unknown>, factor)
        }
      }
    }
  }
}

export function convertRulesetMoney(ruleset: Ruleset, from: Currency, to: Currency): void {
  if (from === to) return
  const factor = fxRate(from, to)
  for (const inst of ruleset.modules) {
    const def = MODULE_MAP[inst.kind]
    if (!def) continue
    for (const field of def.paramSchema) convertField(field, inst.params, factor)
  }
}
