// Real ballots: Portland's November 2024 council contests, converted from the
// county's cast vote records by scripts/convert_cvr.py. The files live in
// public/data and load only when a district is chosen.

import type { Ballot, Candidate, Profile } from './types'

export interface RealFile {
  name: string
  seats: number
  source: string
  stats: Record<string, number>
  candidates: string[]
  ballots: [number, number[]][]
}

export interface RealSet {
  id: string
  name: string
  blurb: string
  file: string
}

export const REAL_SETS: RealSet[] = [1, 2, 3, 4].map((n) => ({
  id: `portland-2024-d${n}`,
  name: `District ${n}`,
  blurb: 'Portland City Council, November 2024.',
  file: `data/portland-2024-d${n}.json`,
}))

/** Short ids for table cells: the surname when it is unique, else the full name. */
function shortIds(names: string[]): string[] {
  const last = names.map((n) => n.split(' ').slice(-1)[0]!)
  return names.map((n, i) => (last.filter((x) => x === last[i]).length === 1 ? last[i]! : n))
}

export function profileFromReal(set: RealSet, file: RealFile): Profile {
  const ids = shortIds(file.candidates)
  const candidates: Candidate[] = file.candidates.map((name, i) => ({ id: ids[i]!, name }))
  const ballots: Ballot[] = file.ballots.map(([n, ranks]) => ({ n, ranks: ranks.map((i) => ids[i]!) }))
  const valid = file.stats.valid ?? ballots.reduce((s, b) => s + b.n, 0)
  return {
    id: set.id,
    name: file.name,
    blurb: `${valid.toLocaleString()} ballots and ${candidates.length} candidates, from the county’s cast vote record.`,
    seats: file.seats,
    candidates,
    ballots,
    real: true,
  }
}

export async function loadReal(set: RealSet): Promise<Profile> {
  const res = await fetch(`./${set.file}`)
  if (!res.ok) throw new Error(`Could not load ${set.file}`)
  return profileFromReal(set, (await res.json()) as RealFile)
}
