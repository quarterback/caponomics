// ─────────────────────────────────────────────────────────────────────────────
// caponomics engine — shared state types
//
// Everything is framework-agnostic and pure. The engine takes a League (rosters)
// and a Ruleset (an invented cap system) and returns a ComplianceReport.
//
// Money is stored as INTEGER dollars — never floats — so marginal-bracket math is
// exact. Financials are scale-agnostic: a "cap" can be $300,000,000 or $40.
// ─────────────────────────────────────────────────────────────────────────────

/** Integer dollars. No cents, no floats. */
export type Money = number

/** A league season, e.g. 2026. */
export type LeagueYear = number

/** Where a cap charge comes from. `base` is a player's straight salary; the rest
 *  are derived by modules (proration/dead money/etc. are reserved for post-MVP). */
export type CapChargeType =
  | 'base'
  | 'proration'
  | 'deadMoney'
  | 'bonus'
  | 'retained'
  | 'hold'

export interface Player {
  id: string
  name: string
  /** Free-form position label (sport-agnostic): 'SP', 'QB', 'PG', 'C', 'F'… */
  pos: string
  /** Years of service — drives min salary / max tiers where a rule uses it. */
  serviceYears: number
}

export interface Contract {
  id: string
  playerId: string
  /** Seasons the deal covers. */
  years: LeagueYear[]
  /** Cap hit per season. In MVP this is the already-prorated number (input data,
   *  not derived). Keyed by year so multi-year is representable from day one. */
  salaryByYear: Record<LeagueYear, Money>
  signingBonus?: Money
  guarantees?: Record<LeagueYear, Money>
  /** 'NTC' | 'NMC' | 'optOut' … — reserved for the transaction sandbox. */
  clauses?: string[]
  acquiredVia?: 'draft' | 'freeAgency' | 'trade' | 'waiver' | 'extension'
}

export interface Team {
  id: string
  name: string
  roster: Contract[]
  /** Optional cash-spend series (distinct from cap hits) for floor rules that
   *  measure cash rather than cap. */
  cashSpendByYear?: Record<LeagueYear, Money>
  /** Engine-populated per evaluation: 'overFirstApron', 'belowFloor', … */
  flags: string[]
}

export interface League {
  id: string
  name: string
  /** Optional sport label, purely informational. */
  sport?: string
  players: Record<string, Player>
  teams: Team[]
  seasonYears: LeagueYear[]
}

// ─── Ruleset (the invented cap system — plain JSON) ─────────────────────────

/** One configured mechanic in a ruleset. `kind` must exist in MODULE_MAP.
 *  Multiple instances of the same kind are allowed (e.g. two aprons). */
export interface ModuleInstance {
  id: string
  kind: string
  enabled: boolean
  params: Record<string, unknown>
}

/** A Ruleset IS the cap system. An ordered list of module instances plus meta. */
export interface Ruleset {
  schemaVersion: number
  id: string
  name: string
  sport?: string
  seasonYears: LeagueYear[]
  modules: ModuleInstance[]
  meta?: {
    author?: string
    notes?: string
    /** Marks a ruleset that was forked from a preset (for the UI badge). */
    forkedFrom?: string
  }
}

// ─── Cap charges & per-team-year results ────────────────────────────────────

export interface CapCharge {
  year: LeagueYear
  amount: Money
  type: CapChargeType
  playerId?: string
  contractId?: string
  /** Which module kind emitted it ('' for engine base charges). */
  sourceModule: string
  /** Whether this charge counts toward the cap total. */
  countsTowardCap: boolean
  note?: string
}

export interface TeamYearTotals {
  /** Sum of charges where countsTowardCap. */
  capSalary: Money
  /** Cash spend if provided, else equals capSalary. */
  cashSpend: Money
  deadMoney: Money
  playerCount: number
}

export type Severity = 'error' | 'warning' | 'info'

export interface Reason {
  severity: Severity
  module: string
  message: string
}

export type PenaltyCurrency = 'money' | 'assets' | 'tools'

export interface Penalty {
  currency: PenaltyCurrency
  amount?: Money
  description: string
  module: string
}

export interface Readout {
  label: string
  value: number
  /** Optional hint for formatting ('money' → currency). */
  format?: 'money' | 'number' | 'percent'
  module: string
}

export interface TeamYearReport {
  teamId: string
  teamName: string
  year: LeagueYear
  capValue: Money | null
  capSheet: CapCharge[]
  totals: TeamYearTotals
  legal: boolean
  /** Status flags set by modules during evaluation (e.g. 'overApron1'). */
  flags: string[]
  reasons: Reason[]
  penalties: Penalty[]
  readouts: Readout[]
}

export interface ComplianceReport {
  rulesetId: string
  rulesetName: string
  byTeamYear: TeamYearReport[]
}
