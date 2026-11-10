// Ballot profiles — the "rosters" of this tool. Hand-built teaching cases plus
// a seeded generator for Portland-shaped districts.

import { FIRST_NAMES, SURNAMES } from './names'
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
    const parts = m[2]!
      .split(/>|,/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.some((x) => x.includes('='))) {
      // Score ballot: "3: A=5, B=2.5". Ranks follow the scores, highest first.
      const scores: Record<string, number> = {}
      for (const x of parts) {
        const sm = /^(.+?)\s*=\s*(\d+(?:\.\d+)?)$/.exec(x)
        if (!sm) return void errors.push(`Line ${i + 1}: expected scores like "A=5, B=3"`)
        const v = Number(sm[2])
        if (v > 5) return void errors.push(`Line ${i + 1}: scores run from 0 to 5`)
        scores[sm[1]!.trim()] = v
      }
      Object.keys(scores).forEach((r) => add(r))
      const ranks = Object.keys(scores)
        .filter((k) => scores[k]! > 0)
        .sort((a, b) => scores[b]! - scores[a]!)
      if (!ranks.length) return void errors.push(`Line ${i + 1}: every score is 0`)
      ballots.push({ n: Number(m[1]), ranks, scores })
      return
    }
    if (!parts.length) return void errors.push(`Line ${i + 1}: no rankings`)
    parts.forEach((r) => add(r))
    ballots.push({ n: Number(m[1]), ranks: parts })
  })
  return { candidates, ballots, errors }
}

export function formatBallots(p: Profile): string {
  const camps = p.candidates.filter((c) => c.camp).map((c) => `${c.id} [${c.camp}]`)
  const lines = p.ballots.map((b) =>
    b.scores
      ? `${b.n}: ${Object.entries(b.scores)
          .filter(([, v]) => v > 0)
          .sort((x, y) => y[1] - x[1])
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}`
      : `${b.n}: ${b.ranks.join(' > ')}`,
  )
  return [...camps, ...(camps.length ? [''] : []), ...lines].join('\n')
}

/** A stable first name for a surname, so hand-built sets show full names. */
function firstNameFor(surname: string): string {
  let h = 2166136261
  for (let i = 0; i < surname.length; i++) h = Math.imul(h ^ surname.charCodeAt(i), 16777619)
  return FIRST_NAMES[(h >>> 0) % FIRST_NAMES.length]!
}

const fromText = (id: string, name: string, blurb: string, seats: number, text: string): Profile => {
  const { candidates, ballots } = parseBallots(text)
  return { id, name, blurb, seats, candidates: candidates.map((c) => ({ ...c, name: `${firstNameFor(c.id)} ${c.id}` })), ballots }
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
  // Names come from their own random stream, so changing a slider keeps the same people.
  const nameRnd = mulberry32(g.seed ^ 0x5bd1e995)
  const surnames: string[] = []
  while (surnames.length < g.candidates) {
    const pick = SURNAMES[Math.floor(nameRnd() * SURNAMES.length)]!
    if (!surnames.includes(pick)) surnames.push(pick)
  }
  const firsts = surnames.map(() => FIRST_NAMES[Math.floor(nameRnd() * FIRST_NAMES.length)]!)
  const cands: (Candidate & { campIdx: number; pull: number })[] = []
  perCamp.forEach((k, ci) => {
    for (let j = 0; j < k; j++) {
      // The surname is the id (short enough for a table cell); the full name is shown where there is room.
      const id = surnames[cands.length]!
      cands.push({ id, name: `${firsts[cands.length]} ${id}`, camp: `Camp ${letters[ci]}`, campIdx: ci, pull: gauss() * 0.8 })
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
    const ranks = scored.slice(0, Math.min(depth, g.maxRanks)).map((x) => x.id)
    // Score ballot from the same preferences: the favourite scores 5, and each
    // other candidate scores less the further they fall below the favourite.
    // A voter who ranks only one candidate scores only that one.
    const best = scored[0]!.u
    const byId = new Map(scored.map((x, i) => [x.id, depth === 1 && i > 0 ? 0 : Math.round(5 * Math.exp(-(best - x.u) / 1.2))]))
    const key = `${ranks.join('>')}|${cands.map((c) => byId.get(c.id)).join(',')}`
    groups.set(key, (groups.get(key) ?? 0) + 1)
  }
  const ballots: Ballot[] = [...groups.entries()]
    .map(([k, n]) => {
      const [r, sc] = k.split('|')
      const vals = sc!.split(',').map(Number)
      const scores: Record<string, number> = {}
      cands.forEach((c, i) => {
        if (vals[i]! > 0) scores[c.id] = vals[i]!
      })
      return { n, ranks: r!.split('>'), scores }
    })
    .sort((a, b) => b.n - a.n)
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
    'Voters for seven small candidates all rank Dravik second. Dravik leads Castellan 26 to 22 for the last seat.',
    3,
    `26: Abara
26: Belmonte
22: Castellan
5: Dravik
3: Eldridge > Dravik
3: Fontaine > Dravik
3: Galloway > Dravik
3: Hartwell > Dravik
3: Ibarra > Dravik
3: Jovanic > Dravik
3: Kessler > Dravik`,
  ),
  fromText(
    'sixty-forty',
    '60 / 40 blocs',
    '60 voters rank one slate. 40 rank another.',
    3,
    `Abara [Majority]
Belmonte [Majority]
Castellan [Majority]
Dravik [Minority]
Eldridge [Minority]
Fontaine [Minority]

60: Abara > Belmonte > Castellan
40: Dravik > Eldridge > Fontaine`,
  ),
  fromText(
    'truncated-majority',
    'Majority that won’t rank',
    '56% of voters back five similar candidates but rank only one or two. 44% back two candidates and rank both.',
    3,
    `Abara [Majority]
Belmonte [Majority]
Castellan [Majority]
Dravik [Majority]
Eldridge [Majority]
Fontaine [Minority]
Galloway [Minority]

13: Abara > Belmonte
12: Belmonte
11: Castellan > Dravik
10: Dravik
10: Eldridge
24: Fontaine > Galloway
20: Galloway > Fontaine`,
  ),
  fromText(
    'trv-paper',
    'Score ballots: TRV paper example',
    'Example 3 from Bewley and Luchini. Two seats. One voter backs Castellan and gives Abara a weak score.',
    2,
    `1: Abara=5
2: Abara=5, Belmonte=2.5
3: Belmonte=5, Abara=2.5
1: Castellan=5, Abara=2.5
2: Castellan=5`,
  ),
  fromText(
    'center-squeeze',
    'Center squeeze',
    'One seat. Most voters prefer Castellan to each rival, but Castellan has the fewest first choices.',
    1,
    `35: Lindqvist > Castellan > Rasmussen
40: Rasmussen > Castellan > Lindqvist
25: Castellan > Lindqvist > Rasmussen`,
  ),
]
