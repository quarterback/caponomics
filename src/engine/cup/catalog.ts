import type { ModuleInstance } from '../types'
import * as C from './modules'
import type { CupModuleDef } from './types'

export const CUP_CATALOG: CupModuleDef[] = [
  C.cupField,
  C.groupStage,
  C.standings,
  C.tiebreakers,
  C.advancement,
  C.knockout,
  C.seasonCount,
  C.prizeMoney,
  C.winnerReward,
  C.cupHouseRule,
]

export const CUP_MAP: Record<string, CupModuleDef> = Object.fromEntries(CUP_CATALOG.map((m) => [m.kind, m]))

export function makeCupInstance(kind: string, idSuffix: string): ModuleInstance | null {
  const def = CUP_MAP[kind]
  if (!def) return null
  return { id: `${kind}-${idSuffix}`, kind, enabled: true, params: structuredClone(def.defaultParams) as Record<string, unknown> }
}
