import { MODULE_MAP } from '../engine/catalog'
import type { ModuleInstance, Ruleset } from '../engine/types'

let counter = 0

/** Build a module instance, backfilling any unspecified params from the module's
 *  defaults so presets only need to state what differs. */
export function m(kind: string, params: Record<string, unknown> = {}): ModuleInstance {
  const def = MODULE_MAP[kind]
  const base = def ? (structuredClone(def.defaultParams) as Record<string, unknown>) : {}
  return {
    id: `${kind}-${++counter}`,
    kind,
    enabled: true,
    params: { ...base, ...params },
  }
}

export function preset(
  id: string,
  name: string,
  sport: string,
  modules: ModuleInstance[],
  year = 2026,
): Ruleset {
  return { schemaVersion: 1, id, name, sport, seasonYears: [year], modules }
}
