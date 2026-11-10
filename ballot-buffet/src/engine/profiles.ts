// Ballot profiles — the "rosters" of this tool. Hand-built teaching cases plus
// a seeded generator for Portland-shaped districts.

import type { Ballot, Candidate, GenParams, Profile } from './types'

// ───────────────────────── text format ─────────────────────────
//
//   26: A
//   3: X1 > D
//   # comment
//   Dana [Camp A]           ← optional candidate line assigning a camp
//
// Candidates are inferred from the ballots in order of first appearance.

export function parseBallots(text: string): { candidates: Candidate[]; ballots: Ballot[]; errors: string[] } {
  const candidates: Candidate[] = []
  const byId = new Map<string, Candidate>()
  const ballots: Ballot[] = []
  const errors: string[] = []
  const add = (name: string, camp?: string) => {
    let c = byId.get(name)
    if (!c) {
      c = { id: name, name }
      byId.set(name, c)
      candidates.push(c)
    }
    if (camp) c.camp = camp
  }
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) return
    const camp = /^([^:>]+?)\s*\[(.+)\]$/.exec(line)
    if (camp) return add(camp[1]!.trim(), camp[2]!.trim())
    const m = /^(\d+(?:\.\d+)?)\s*[:x×]\s*(.+)$/.exec(line)
    if (!m) return void errors.push(`Line ${i + 1}: expected "count: A > B > C"`)
    const ranks = m[2]!
      .split(/>|,/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!ranks.length) return void errors.push(`Line ${i + 1}: no rankings`)
    ranks.forEach((r) => add(r))
    ballots.push({ n: Number(m[1]), ranks })
  })
  return { candidates, ballots, errors }
}

export function formatBallots(p: Profile): string {
  const camps = p.candidates.filter((c) => c.camp).map((c) => `${c.id} [${c.camp}]`)
  const lines = p.ballots.map((b) => `${b.n}: ${b.ranks.join(' > ')}`)
  return [...camps, ...(camps.length ? [''] : []), ...lines].join('\n')
}

const fromText = (id: string, name: string, blurb: string, seats: number, text: string): Profile => {
  const { candidates, ballots } = parseBallots(text)
  return { id, name, blurb, seats, candidates, ballots }
}

// ───────────────────────── generator ─────────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DEFAULT_GEN: GenParams = {
  seed: 2024,
  voters: 3000,
  candidates: 18,
  camps: [0.42, 0.33, 0.25],
  cohesion: 0.15,
  bullet: 0.12,
  maxRanks: 6,
}

/** Synthetic district. Voters and candidates sit in camps; `cohesion` sets how
 *  much a voter's ranking follows camp lines versus each candidate's personal
 *  pull. Low cohesion = free radicals; high = slates. */
export function generateProfile(g: GenParams, meta?: Partial<Profile>): Profile {
  const rnd = mulberry32(g.seed)
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd())
  const shareSum = g.camps.reduce((s, x) => s + x, 0) || 1
  const shares = g.camps.map((x) => x / shareSum)
  const letters = 'ABCDEFGH'
  const pickCamp = () => {
    let r = rnd()
    for (let i = 0; i < shares.length; i++) if ((r -= shares[i]!) <= 0) return i
    return shares.length - 1
  }
  // Candidates: dealt to camps in proportion to camp size (at least one each).
  const perCamp = shares.map((s) => Math.max(1, Math.round(s * g.candidates)))
  while (perCamp.reduce((s, x) => s + x, 0) > g.candidates) perCamp[perCamp.indexOf(Math.max(...perCamp))]!--
  while (perCamp.reduce((s, x) => s + x, 0) < g.candidates) perCamp[perCamp.indexOf(Math.max(...perCamp))]!++
  const cands: (Candidate & { campIdx: number; pull: number })[] = []
  perCamp.forEach((k, ci) => {
    for (let j = 0; j < k; j++) {
      const id = `${letters[ci]}${j + 1}`
      cands.push({ id, name: id, camp: `Camp ${letters[ci]}`, campIdx: ci, pull: gauss() * 0.8 })
    }
  })
  const groups = new Map<string, number>()
  for (let v = 0; v < g.voters; v++) {
    const camp = pickCamp()
    const depth = rnd() < g.bullet ? 1 : 2 + Math.floor(rnd() * Math.max(1, g.maxRanks - 1))
    const scored = cands.map((c) => ({
      id: c.id,
      u: (c.campIdx === camp ? 4 * g.cohesion : 0) + c.pull + gauss() * (1.2 - 0.6 * g.cohesion),
    }))
    scored.sort((a, b) => b.u - a.u)
    const key = scored
      .slice(0, Math.min(depth, g.maxRanks))
      .map((s) => s.id)
      .join('>')
    groups.set(key, (groups.get(key) ?? 0) + 1)
  }
  const ballots: Ballot[] = [...groups.entries()].map(([k, n]) => ({ n, ranks: k.split('>') })).sort((a, b) => b.n - a.n)
  return {
    id: 'generated',
    name: 'Generated district',
    blurb: `${g.voters.toLocaleString()} voters and ${g.candidates} candidates.`,
    seats: 3,
    candidates: cands.map(({ id, name, camp }) => ({ id, name, camp })),
    ballots,
    gen: g,
    ...meta,
  }
}

// ───────────────────────── presets ─────────────────────────

export const PROFILES: Profile[] = [
  generateProfile(DEFAULT_GEN, {
    id: 'free-radicals',
    name: 'Free radicals',
    blurb: '18 candidates in three camps. Voters rarely follow a slate.',
  }),
  generateProfile(
    { ...DEFAULT_GEN, cohesion: 0.9, bullet: 0.05 },
    { id: 'slates', name: 'Disciplined slates', blurb: 'The same district. Voters rank their own camp first.' },
  ),
  fromText(
    'rank-decay',
    'Seven small candidates, one backup',
    'Voters for seven small candidates all rank D second. D leads C 26 to 22 for the last seat.',
    3,
    `26: A
26: B
22: C
5: D
3: X1 > D
3: X2 > D
3: X3 > D
3: X4 > D
3: X5 > D
3: X6 > D
3: X7 > D`,
  ),
  fromText(
    'sixty-forty',
    '60 / 40 blocs',
    '60 voters rank one slate. 40 rank another.',
    3,
    `A [Majority]
B [Majority]
C [Majority]
D [Minority]
E [Minority]
F [Minority]

60: A > B > C
40: D > E > F`,
  ),
  fromText(
    'truncated-majority',
    'Majority that won’t rank',
    '56% of voters back five similar candidates but rank only one or two. 44% back two candidates and rank both.',
    3,
    `P1 [Majority]
P2 [Majority]
P3 [Majority]
P4 [Majority]
P5 [Majority]
M1 [Minority]
M2 [Minority]

13: P1 > P2
12: P2
11: P3 > P4
10: P4
10: P5
24: M1 > M2
20: M2 > M1`,
  ),
  fromText(
    'center-squeeze',
    'Center squeeze',
    'One seat. Most voters prefer C to each rival, but C has the fewest first choices.',
    1,
    `35: L > C > R
40: R > C > L
25: C > L > R`,
  ),
]
