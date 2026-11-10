// Core data model. Ballots and counting systems are fully decoupled: any
// ballot profile runs through any system.

export interface Candidate {
  id: string
  name: string
  /** Optional bloc / camp the candidate belongs to (used for seats-vs-votes readouts). */
  camp?: string
}

/** `n` identical ballots ranking `ranks` (candidate ids, most-preferred first). */
export interface Ballot {
  n: number
  ranks: string[]
}

export interface GenParams {
  seed: number
  voters: number
  candidates: number
  /** Share of voters in each camp (normalised). */
  camps: number[]
  /** 0 = free radicals (personal appeal only) … 1 = disciplined slates. */
  cohesion: number
  /** Share of voters who rank only one candidate. */
  bullet: number
  /** Maximum rankings a ballot allows (Portland: 6). */
  maxRanks: number
}

export interface Profile {
  id: string
  name: string
  blurb: string
  /** Seats the scenario was written for (loaded into the contest on select). */
  seats: number
  candidates: Candidate[]
  ballots: Ballot[]
  gen?: GenParams
}

export type Method = 'stv' | 'meek' | 'mcpc' | 'sntv'

export interface System {
  id: string
  name: string
  blurb: string
  method: Method

  // ── Sequential (Gregory-family) STV ──
  /** droop = ⌊N/(S+1)⌋+1 · exact = N/(S+1) · hare = N/S · custom = quotaShare·N */
  quota: 'droop' | 'exact' | 'hare' | 'custom'
  quotaShare: number
  /** all = quota uses every seat · stv = only the seats the STV count fills. */
  quotaBasis: 'all' | 'stv'
  surplus: 'wigm' | 'last-parcel' | 'none'
  surplusOrder: 'simultaneous' | 'largest'
  /** Truncate surplus fractions and transfer values to 4 decimals (Portland code). */
  truncate: boolean
  elimination: 'lowest' | 'btr' | 'borda'
  /** Value a ballot keeps each time it moves after an elimination (1 = no decay). */
  decay: number
  /** What happens when continuing candidates ≤ unfilled seats. */
  completion: 'elect-remaining' | 'finisher'
  /** Seats held out of the STV count and filled by a fresh, full-value count. */
  resetSeats: number
  finisher: 'irv' | 'condorcet'

  // ── Meek / Warren ──
  meekVariant: 'meek' | 'warren'

  // ── Mandate-Constrained Proportional Consent ──
  /** A voter "consents" to candidates in their top-N rankings. */
  consentDepth: number
  /** Minimum consent share every winner must have. */
  mandate: number
}

export type WinHow = 'quota' | 'remaining' | 'finisher' | 'committee' | 'plurality'

export interface Winner {
  id: string
  how: WinHow
  round: number
  /** Vote value behind the candidate when declared elected. */
  tally: number
}

export type CandStatus = 'hopeful' | 'elected' | 'eliminated'

export interface Round {
  n: number
  /** Stage label, e.g. "STV count" or "Seat 3 · fresh count". */
  phase: string
  tallies: Record<string, number>
  status: Record<string, CandStatus>
  /** Cumulative vote value with no further usable ranking. */
  exhausted: number
  /** Cumulative vote value destroyed by rule (rank decay, truncation residue). */
  lost: number
  elected: string[]
  eliminated: string[]
  note: string
}

export interface ConsentRow {
  id: string
  share: number
  qualifies: boolean
}

export interface CountResult {
  winners: Winner[]
  rounds: Round[]
  quota: number | null
  /** Valid ballots (those ranking at least one candidate). */
  total: number
  exhausted: number
  lost: number
  notes: string[]
  consent?: ConsentRow[]
}
