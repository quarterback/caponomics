// ─────────────────────────────────────────────────────────────────────────────
// The evaluation pipeline. evaluateRuleset(league, ruleset) → ComplianceReport.
//
// Per team, per season-year, in three phases — phase-first, then Ruleset order
// within a phase (so "Ruleset = ordered list" stays true while thresholds still
// see the cap value):
//   1. environment — revenuePool → capFormula populate env.capValue
//   2. charge      — engine base charges first, then contributes() modules
//   3. validate    — each validate() reads the finished sheet → ModuleResult
//
// Combination: legal = AND(all modules); reasons/penalties/readouts concatenated
// in Ruleset order.
// ─────────────────────────────────────────────────────────────────────────────

import { MODULE_MAP } from './catalog'
import { baseSalaryCharges, computeTotals } from './charges'
import { fxRate } from './format'
import type { EnvironmentState, EvalContext } from './module'
import type {
  ComplianceReport,
  League,
  LeagueYear,
  ModuleInstance,
  Ruleset,
  Team,
  TeamYearReport,
} from './types'

function activeModules(ruleset: Ruleset): ModuleInstance[] {
  return ruleset.modules.filter((m) => m.enabled && MODULE_MAP[m.kind])
}

function evaluateTeamYear(
  league: League,
  ruleset: Ruleset,
  team: Team,
  year: LeagueYear,
): TeamYearReport {
  const modules = activeModules(ruleset)

  const env: EnvironmentState = {
    revenue: null,
    playerShare: null,
    capValue: null,
    scratch: {},
  }

  const ctx: EvalContext = {
    league,
    team,
    year,
    ruleset,
    env,
    charges: [],
    totals: { capSalary: 0, cashSpend: 0, deadMoney: 0, playerCount: 0 },
    flags: [],
    scratch: {},
  }

  // ── Phase 1: environment ──────────────────────────────────────────────────
  for (const inst of modules) {
    const def = MODULE_MAP[inst.kind]!
    if (!def.computeEnvironment) continue
    const patch = def.computeEnvironment(inst.params, ctx)
    if (patch.revenue !== undefined) env.revenue = patch.revenue
    if (patch.playerShare !== undefined) env.playerShare = patch.playerShare
    if (patch.capValue !== undefined) env.capValue = patch.capValue
    if (patch.scratch) Object.assign(env.scratch, patch.scratch)
  }

  // ── Phase 2: charge (engine base charges first, then modules) ─────────────
  // Convert the league's payrolls into the ruleset's currency so a cap authored
  // in one currency can be tested against a league priced in another.
  const factor = fxRate(league.currency ?? 'USD', ruleset.currency ?? 'USD')
  ctx.charges = baseSalaryCharges(team, year, factor)
  ctx.totals = computeTotals(ctx.charges, team, year)
  for (const inst of modules) {
    const def = MODULE_MAP[inst.kind]!
    if (!def.contributes) continue
    const added = def.contributes(inst.params, ctx)
    if (added.length) {
      ctx.charges.push(...added)
      ctx.totals = computeTotals(ctx.charges, team, year)
    }
  }

  // ── Phase 3: validate ─────────────────────────────────────────────────────
  const report: TeamYearReport = {
    teamId: team.id,
    teamName: team.name,
    year,
    capValue: env.capValue,
    capSheet: ctx.charges,
    totals: ctx.totals,
    legal: true,
    flags: ctx.flags,
    reasons: [],
    penalties: [],
    readouts: [],
  }

  for (const inst of modules) {
    const def = MODULE_MAP[inst.kind]!
    if (!def.validate) continue
    const res = def.validate(inst.params, ctx)
    if (!res.legal) report.legal = false
    report.reasons.push(...res.reasons)
    report.penalties.push(...res.penalties)
    report.readouts.push(...res.readouts)
  }

  return report
}

export function evaluateRuleset(league: League, ruleset: Ruleset): ComplianceReport {
  const byTeamYear: TeamYearReport[] = []
  // Evaluate over the ruleset's season years, intersected with what the roster
  // actually carries. Default to the league's own years if none overlap.
  const years = ruleset.seasonYears.length ? ruleset.seasonYears : league.seasonYears
  for (const team of league.teams) {
    for (const year of years) {
      byTeamYear.push(evaluateTeamYear(league, ruleset, team, year))
    }
  }
  return { rulesetId: ruleset.id, rulesetName: ruleset.name, byTeamYear }
}
