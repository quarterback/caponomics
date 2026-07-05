// Deterministic roster generator. Real team names + realistic payroll spreads,
// seeded so results are stable across renders (no Math.random at eval time in a
// way that changes between loads — the seed is fixed per team). Player names are
// plausible-but-fictional for the depth chart; the point is cap outcomes, not a
// transfer-accurate roster.
import type { StarInput, TeamInput } from './build'

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = [
  'Marcus', 'Andre', 'Cole', 'Diego', 'Tyrese', 'Xavier', 'Malik', 'Rhys', 'Kai', 'Emmett',
  'Dominic', 'Tobias', 'Silas', 'Rafael', 'Nolan', 'Jaylen', 'Cade', 'Bruno', 'Enzo', 'Owen',
  'Griffin', 'Dante', 'Roman', 'Amari', 'Beckett', 'Luca', 'Josiah', 'Kellan', 'Zane', 'Otto',
]
const LAST = [
  'Bell', 'Cruz', 'Hayes', 'Okafor', 'Vance', 'Mercer', 'Solis', 'Whitaker', 'Nakamura', 'Boone',
  'Ferreira', 'Callahan', 'Dvorak', 'Amboise', 'Reyes', 'Kessler', 'Lindqvist', 'Marsh', 'Pryce', 'Osei',
  'Delgado', 'Ricci', 'Novak', 'Bauer', 'Salazar', 'Quinn', 'Rowe', 'Ibrahim', 'Stone', 'Vega',
]

export interface GenOpts {
  rosterSize: number
  minSalary: number
  positions: string[]
  starCount?: number
  /** Relative weights for star salaries, high→low. Length caps starCount. */
  weights?: number[]
}

/** Build one team whose total payroll lands near `target`. */
export function genTeam(id: string, teamName: string, target: number, seed: number, opts: GenOpts): TeamInput {
  const rand = mulberry32(seed)
  const weights = opts.weights ?? [0.26, 0.2, 0.16, 0.13, 0.14, 0.11]
  const starCount = Math.min(opts.starCount ?? weights.length, weights.length)
  const w = weights.slice(0, starCount)
  const wsum = w.reduce((a, b) => a + b, 0)

  const fillerCount = Math.max(0, opts.rosterSize - starCount)
  const fillerTotal = fillerCount * opts.minSalary
  const starBudget = Math.max(starCount * opts.minSalary, target - fillerTotal)

  const used = new Set<string>()
  const pick = (): string => {
    for (let i = 0; i < 12; i++) {
      const n = `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`
      if (!used.has(n)) {
        used.add(n)
        return n
      }
    }
    return `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`
  }

  const stars: StarInput[] = w.map((weight) => {
    const jitter = 0.85 + rand() * 0.3
    let salary = Math.round(((starBudget * weight) / wsum) * jitter / 1_000_000) * 1_000_000
    salary = Math.max(opts.minSalary, salary)
    const pos = opts.positions[Math.floor(rand() * opts.positions.length)]!
    const service = 2 + Math.floor(rand() * 13)
    return { name: pick(), pos, salary, service }
  })

  return { id, name: teamName, fillTo: opts.rosterSize, fillSalary: opts.minSalary, stars }
}

export const MLB_OPTS: GenOpts = {
  rosterSize: 26,
  minSalary: 800_000,
  positions: ['SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'],
  starCount: 10,
  // Spread across a realistic top-10 so payroll (not one star's max) drives it.
  weights: [0.15, 0.13, 0.12, 0.11, 0.1, 0.09, 0.08, 0.08, 0.07, 0.07],
}
export const NBA_OPTS: GenOpts = {
  rosterSize: 15,
  minSalary: 1_200_000,
  positions: ['G', 'G', 'F', 'F', 'C'],
  starCount: 8,
  weights: [0.2, 0.17, 0.15, 0.13, 0.1, 0.09, 0.08, 0.08],
}
export const NFL_OPTS: GenOpts = {
  rosterSize: 53,
  minSalary: 1_000_000,
  positions: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'],
  starCount: 10,
  weights: [0.2, 0.14, 0.12, 0.1, 0.09, 0.08, 0.08, 0.07, 0.07, 0.05],
}
export const NHL_OPTS: GenOpts = {
  rosterSize: 23,
  minSalary: 775_000,
  positions: ['C', 'LW', 'RW', 'D', 'D', 'G'],
  starCount: 9,
  weights: [0.18, 0.16, 0.14, 0.12, 0.1, 0.09, 0.08, 0.07, 0.06],
}
