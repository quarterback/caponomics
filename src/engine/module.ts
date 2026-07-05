// ─────────────────────────────────────────────────────────────────────────────
// The CapModuleDef interface — the extensibility spine.
//
// One small module object per mechanic, registered in a flat catalog keyed by a
// string `kind` (see catalog.ts). Inventing a mechanic = add one module + one
// catalog entry. This mirrors the Lottery Lab's Protocol + ALL_SYSTEMS registry.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CapCharge,
  League,
  LeagueYear,
  Money,
  Penalty,
  Readout,
  Reason,
  Ruleset,
  Team,
  TeamYearTotals,
} from './types'

/** Modules run in phase order so thresholds always see the cap value. */
export type ModulePhase = 'environment' | 'charge' | 'validate'

export type ModuleCategory =
  | 'revenue'
  | 'cap'
  | 'floor'
  | 'tax'
  | 'apron'
  | 'contract'
  | 'roster'
  | 'penalty'
  | 'exception'
  | 'misc'

/** Shared environment computed in the first phase and read by later phases. */
export interface EnvironmentState {
  revenue: Money | null
  playerShare: Money | null
  /** The season's cap number. Thresholds expressed as % of cap read this. */
  capValue: Money | null
  scratch: Record<string, unknown>
}

/** What a validate() call returns. Combined across modules by the pipeline. */
export interface ModuleResult {
  legal: boolean
  reasons: Reason[]
  penalties: Penalty[]
  readouts: Readout[]
}

/** Context handed to every module method for one (team, year). */
export interface EvalContext {
  league: League
  team: Team
  year: LeagueYear
  ruleset: Ruleset
  env: EnvironmentState
  /** Accumulated cap sheet for this team/year (filled during the charge phase). */
  charges: CapCharge[]
  totals: TeamYearTotals
  /** Status flags set by modules (e.g. 'overApron1'). Collected into the report. */
  flags: string[]
  /** Module-to-module handoff within one evaluation (e.g. cornerstone ids). */
  scratch: Record<string, unknown>
}

// ─── Param schema — drives schema-generated forms (zero bespoke UI per module) ─

export interface ParamFieldBase {
  key: string
  label: string
  help?: string
}
export type ParamField =
  | (ParamFieldBase & { type: 'text'; default: string; placeholder?: string })
  | (ParamFieldBase & { type: 'money'; default: number; min?: number; max?: number })
  | (ParamFieldBase & { type: 'number'; default: number; min?: number; max?: number; step?: number })
  | (ParamFieldBase & { type: 'percent'; default: number; min?: number; max?: number })
  | (ParamFieldBase & { type: 'boolean'; default: boolean })
  | (ParamFieldBase & {
      type: 'enum'
      options: { value: string; label: string }[]
      default: string
    })
  | (ParamFieldBase & {
      type: 'enumMulti'
      options: { value: string; label: string }[]
      default: string[]
    })
  | (ParamFieldBase & {
      type: 'bracketList'
      itemSchema: ParamField[]
      default: unknown[]
    })

export type ModuleResultLike = Partial<ModuleResult>

export interface CapModuleDef<P = Record<string, unknown>> {
  kind: string
  label: string
  category: ModuleCategory
  phase: ModulePhase
  blurb: string
  paramSchema: ParamField[]
  defaultParams: P

  /** environment phase: contribute to revenue / cap value. */
  computeEnvironment?(p: P, ctx: EvalContext): Partial<EnvironmentState>
  /** charge phase: add or adjust cap charges. */
  contributes?(p: P, ctx: EvalContext): CapCharge[]
  /** validate phase: read the finished cap sheet → legal/illegal + info. */
  validate?(p: P, ctx: EvalContext): ModuleResult

  // ── Reserved for the deferred transaction sandbox / projection ──
  transform?(p: P, state: League, txn: unknown): League
  project?(p: P, ctx: EvalContext, years: LeagueYear[]): unknown
}

/** Helper so modules can return a well-formed ModuleResult tersely. */
export function result(partial: ModuleResultLike = {}): ModuleResult {
  return {
    legal: partial.legal ?? true,
    reasons: partial.reasons ?? [],
    penalties: partial.penalties ?? [],
    readouts: partial.readouts ?? [],
  }
}
