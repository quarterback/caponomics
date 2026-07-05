// League-wide roll-up of a ComplianceReport — the heart of the tool: how does a
// cap system play out across an ENTIRE league, and what penalties land?
import type { ComplianceReport, Money, TeamYearReport } from './types'

export interface TeamRow {
  teamId: string
  teamName: string
  payroll: Money
  capValue: Money | null
  /** payroll − cap (positive = over the cap line). null if no cap set. */
  vsCap: Money | null
  tax: Money
  /** shortfall below the floor (positive = under floor). */
  floorGap: Money
  apronLevel: number
  legal: boolean
  errorCount: number
  penaltyMoney: Money
  hasAssetPenalty: boolean
  hasToolPenalty: boolean
  report: TeamYearReport
}

export interface LeagueSummary {
  teams: TeamRow[]
  teamCount: number
  illegalCount: number
  overCapCount: number
  belowFloorCount: number
  inTaxCount: number
  totalTax: Money
  totalPenaltyMoney: Money
  apronCounts: Record<number, number>
  payrollMin: Money
  payrollMax: Money
  payrollTotal: Money
  payrollAvg: Money
  /** Coefficient of variation of payroll (spread ÷ mean) — a competitive-balance
   *  proxy. Lower = more even. */
  payrollCV: number
}

function readout(t: TeamYearReport, label: string): number {
  return t.readouts.find((r) => r.label === label)?.value ?? 0
}

function apronLevelFrom(flags: string[]): number {
  let lvl = 0
  for (const f of flags) {
    const m = /^overApron(\d+)$/.exec(f)
    if (m) lvl = Math.max(lvl, Number(m[1]))
  }
  return lvl
}

export function summarizeLeague(report: ComplianceReport): LeagueSummary {
  // One row per team (first evaluated year).
  const seen = new Set<string>()
  const rows: TeamRow[] = []
  for (const t of report.byTeamYear) {
    if (seen.has(t.teamId)) continue
    seen.add(t.teamId)
    const payroll = t.totals.capSalary
    const tax = readout(t, 'Tax owed')
    const floorGap = readout(t, 'Floor gap')
    rows.push({
      teamId: t.teamId,
      teamName: t.teamName,
      payroll,
      capValue: t.capValue,
      vsCap: t.capValue === null ? null : payroll - t.capValue,
      tax,
      floorGap,
      apronLevel: apronLevelFrom(t.flags),
      legal: t.legal,
      errorCount: t.reasons.filter((r) => r.severity === 'error').length,
      penaltyMoney: t.penalties.filter((p) => p.currency === 'money').reduce((a, p) => a + (p.amount ?? 0), 0),
      hasAssetPenalty: t.penalties.some((p) => p.currency === 'assets'),
      hasToolPenalty: t.penalties.some((p) => p.currency === 'tools'),
      report: t,
    })
  }

  const payrolls = rows.map((r) => r.payroll)
  const payrollTotal = payrolls.reduce((a, b) => a + b, 0)
  const payrollAvg = rows.length ? payrollTotal / rows.length : 0
  const variance = rows.length
    ? payrolls.reduce((a, p) => a + (p - payrollAvg) ** 2, 0) / rows.length
    : 0
  const payrollCV = payrollAvg ? Math.sqrt(variance) / payrollAvg : 0

  const apronCounts: Record<number, number> = {}
  for (const r of rows) if (r.apronLevel > 0) apronCounts[r.apronLevel] = (apronCounts[r.apronLevel] ?? 0) + 1

  return {
    teams: rows,
    teamCount: rows.length,
    illegalCount: rows.filter((r) => !r.legal).length,
    overCapCount: rows.filter((r) => r.vsCap !== null && r.vsCap > 0).length,
    belowFloorCount: rows.filter((r) => r.floorGap > 0).length,
    inTaxCount: rows.filter((r) => r.tax > 0).length,
    totalTax: rows.reduce((a, r) => a + r.tax, 0),
    totalPenaltyMoney: rows.reduce((a, r) => a + r.penaltyMoney, 0),
    apronCounts,
    payrollMin: payrolls.length ? Math.min(...payrolls) : 0,
    payrollMax: payrolls.length ? Math.max(...payrolls) : 0,
    payrollTotal,
    payrollAvg: Math.round(payrollAvg),
    payrollCV,
  }
}
