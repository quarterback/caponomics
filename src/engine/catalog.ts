// The module registry — the "add one entry = invent a mechanic" seam.
import type { CapModuleDef } from './module'
import * as M from './modules'

export const MODULE_CATALOG: CapModuleDef[] = [
  M.revenuePool,
  M.capFormula,
  M.allocationPool,
  M.hardCap,
  M.salaryFloor,
  M.luxuryTax,
  M.apron,
  M.maxContract,
  M.minimumSalary,
  M.rosterLimits,
  M.positionCap,
  M.draftPickPenalty,
  M.retainedRights,
  M.amnesty,
  M.deadMoney,
  M.passThrough,
]

export const MODULE_MAP: Record<string, CapModuleDef> = Object.fromEntries(
  MODULE_CATALOG.map((m) => [m.kind, m]),
)

/** Instantiate a fresh ModuleInstance from a catalog def (deep-copies defaults). */
export function makeInstance(kind: string, idSuffix: string): {
  id: string
  kind: string
  enabled: boolean
  params: Record<string, unknown>
} | null {
  const def = MODULE_MAP[kind]
  if (!def) return null
  return {
    id: `${kind}-${idSuffix}`,
    kind,
    enabled: true,
    params: structuredClone(def.defaultParams) as Record<string, unknown>,
  }
}
