// ─────────────────────────────────────────────────────────────────────────────
// caponomics expansion engine — shared types
//
// An ExpansionModel is to an expansion draft what a Ruleset is to a cap system:
// an ordered stack of small, string-keyed rule modules plus meta. Deliberately
// there is NO pick-resolution step — this side of the tool is a rules
// constructor ("what are the variables, mix and match them"), not a draft
// simulator. Modules therefore describe themselves in plain language instead of
// evaluating a roster.
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency } from '../format'
import type { ParamField } from '../module'
import type { ModuleInstance } from '../types'

export type ExpansionCategory =
  | 'protection'
  | 'exemption'
  | 'exposure'
  | 'selection'
  | 'rounds'
  | 'financial'
  | 'special'

/** The invented expansion-draft model — plain JSON, same as a Ruleset. */
export interface ExpansionModel {
  schemaVersion: number
  id: string
  name: string
  sport?: string
  /** Currency for the model's money figures (default USD). */
  currency?: Currency
  /** How many new franchises join at once (1 or 2 historically; go wild). */
  teamsAdded: number
  modules: ModuleInstance[]
  meta?: {
    notes?: string
    forkedFrom?: string
  }
}

/** Context handed to describe() so rules can do roster-free quick math. */
export interface DescribeContext {
  teamsAdded: number
  /** Team count of the currently loaded league, if one is loaded. */
  existingTeams: number | null
  currency: Currency
}

/** One expansion rule. Same catalog shape as CapModuleDef, but instead of the
 *  evaluate pipeline it renders itself as plain-language rulebook lines. */
export interface ExpansionModuleDef<P = Record<string, unknown>> {
  kind: string
  label: string
  category: ExpansionCategory
  blurb: string
  paramSchema: ParamField[]
  defaultParams: P
  /** Plain-language rulebook lines for the summary panel. */
  describe(p: P, ctx: DescribeContext): string[]
}

/** A category-grouped section of the rendered rulebook. */
export interface RulebookSection {
  category: ExpansionCategory
  title: string
  lines: string[]
}

/** Roster-free "at a glance" stat for the summary panel. */
export interface ModelStat {
  label: string
  value: string
}

export interface ModelSummary {
  stats: ModelStat[]
  sections: RulebookSection[]
}
