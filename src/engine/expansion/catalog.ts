// The expansion-rule registry — same "add one entry = invent a rule" seam as
// the cap side's MODULE_CATALOG.
import type { ModuleInstance } from '../types'
import type { ExpansionModuleDef } from './types'
import * as X from './modules'

export const EXPANSION_CATALOG: ExpansionModuleDef[] = [
  X.protectionScheme,
  X.mustProtect,
  X.youngPlayerExemption,
  X.autoProtect,
  X.injuryExemption,
  X.exposureMinimums,
  X.expensiveListingCap,
  X.selectionQuota,
  X.lossLimit,
  X.pullback,
  X.rosterTargets,
  X.specialStatusRules,
  X.rounds,
  X.multiTeamFormat,
  X.financialWindow,
  X.compensation,
  X.expansionCapRamp,
  X.preDraftWindow,
  X.sideDeals,
  X.pickRights,
  X.houseRule,
]

export const EXPANSION_MAP: Record<string, ExpansionModuleDef> = Object.fromEntries(
  EXPANSION_CATALOG.map((m) => [m.kind, m]),
)

/** Instantiate a fresh rule instance from a catalog def (deep-copies defaults). */
export function makeExpansionInstance(kind: string, idSuffix: string): ModuleInstance | null {
  const def = EXPANSION_MAP[kind]
  if (!def) return null
  return {
    id: `${kind}-${idSuffix}`,
    kind,
    enabled: true,
    params: structuredClone(def.defaultParams) as Record<string, unknown>,
  }
}
