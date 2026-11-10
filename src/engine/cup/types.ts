// ─────────────────────────────────────────────────
// Cup format engine — shared types
//
// A CupModel is to an in-season cup what an ExpansionModel is to an expansion
// draft: an ordered stack of small, string-keyed rule modules. The tool holds
// no schedules or results, so nothing here plays a game. Each rule describes
// itself in plain language, and the summary does arithmetic that needs only
// the number of teams.
// ─────────────────────────────────────────────────

import type { Currency } from '../format'
import type { ParamField } from '../module'
import type { ModuleInstance } from '../types'

export type CupCategory = 'field' | 'groups' | 'advance' | 'knockout' | 'schedule' | 'prize' | 'special'

export interface CupModel {
  schemaVersion: number
  id: string
  name: string
  sport?: string
  currency?: Currency
  modules: ModuleInstance[]
  meta?: { notes?: string; forkedFrom?: string }
}

export interface CupContext {
  /** Team count of the loaded league. */
  teams: number
  currency: Currency
}

export interface CupModuleDef<P = Record<string, unknown>> {
  kind: string
  label: string
  category: CupCategory
  blurb: string
  paramSchema: ParamField[]
  defaultParams: P
  /** Plain-language rulebook lines. */
  describe(p: P, ctx: CupContext): string[]
}

export interface CupSection {
  category: CupCategory
  title: string
  lines: string[]
}

export interface CupStat {
  label: string
  value: string
}

export interface CupSummary {
  stats: CupStat[]
  sections: CupSection[]
}
