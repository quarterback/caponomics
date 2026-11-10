// The counting engine. Pure and framework-free:
//   runCount(profile, system, seats) → CountResult
//
// Four method families share one result shape:
//   stv   — sequential Gregory-family STV with swappable quota / surplus /
//           elimination / completion rules, plus optional "reset" seats
//   meek  — Meek or Warren keep-value STV
//   mcpc  — Mandate-Constrained Proportional Consent (committee optimisation)
//   sntv  — first-choice plurality baseline
//
// Ties are broken deterministically (fewest first choices, then ballot order)
// so a count is reproducible. Portland breaks ties by lot.

import type { Ballot, CandStatus, CountResult, Profile, Round, System, Winner } from './types'

const EPS = 1e-9
const trunc4 = (x: number) => Math.floor(x * 10000 + 1e-7) / 10000

/** Ballots restricted to known candidates, duplicates dropped, empties removed. */
export function cleanBallots(profile: Profile): Ballot[] {
  const known = new Set(profile.candidates.map((c) => c.id))
  const out: Ballot[] = []
  for (const b of profile.ballots) {
    const seen = new Set<string>()
    const ranks = b.ranks.filter((r) => known.has(r) && !seen.has(r) && (seen.add(r), true))
    if (ranks.length && b.n > 0) out.push({ n: b.n, ranks })
  }
  return out
}

export function quotaFor(system: System, total: number, seats: number): number {
  switch (system.quota) {
    case 'droop':
      return Math.floor(total / (seats + 1)) + 1
    case 'exact':
      return total / (seats + 1)
    case 'hare':
      return total / seats
    case 'custom':
      return system.quotaShare * total
  }
}

/** Head-to-head: weight preferring a over b, and b over a (unranked = last). */
export function pairwise(ballots: { n: number; ranks: string[] }[], a: string, b: string): [number, number] {
  let pa = 0
  let pb = 0
  for (const bl of ballots) {
    const ia = bl.ranks.indexOf(a)
    const ib = bl.ranks.indexOf(b)
    if (ia === ib) continue
    if (ib < 0 || (ia >= 0 && ia < ib)) pa += bl.n
    else pb += bl.n
  }
  return [pa, pb]
}

export function runCount(profile: Profile, system: System, seatsIn: number): CountResult {
  const ballots = cleanBallots(profile)
  const ids = profile.candidates.map((c) => c.id)
  const seats = Math.max(1, Math.min(seatsIn, ids.length))
  const total = ballots.reduce((s, b) => s + b.n, 0)
  if (system.method === 'meek') return meekCount(ballots, ids, system, seats, total)
  if (system.method === 'mcpc') return mcpcCount(ballots, ids, system, seats, total)
  if (system.method === 'sntv') return sntvCount(ballots, ids, seats, total)
  return stvCount(ballots, ids, system, seats, total)
}

// ───────────────────────── sequential STV ─────────────────────────

interface Pile {
  n: number
  ranks: string[]
  /** Current transfer value of each ballot in the pile. */
  w: number
  /** Candidate currently holding the pile (null = exhausted). */
  at: string | null
  pos: number
  arrived: number
}

function stvCount(ballots: Ballot[], ids: string[], system: System, seats: number, total: number): CountResult {
  const resetSeats = Math.max(0, Math.min(system.resetSeats, seats))
  const stvSeats = seats - resetSeats
  const quotaSeats = system.quotaBasis === 'stv' && stvSeats > 0 ? stvSeats : seats
  const quota = quotaFor(system, total, quotaSeats)
  const order = new Map(ids.map((id, i) => [id, i]))
  const status: Record<string, CandStatus> = Object.fromEntries(ids.map((id) => [id, 'hopeful']))
  const firsts: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))
  const retained: Record<string, number> = {}
  const winners: Winner[] = []
  const rounds: Round[] = []
  const notes: string[] = []
  let exhausted = 0
  let lost = 0
  let pending: string[] = []
  const ties: number[] = []

  const piles: Pile[] = ballots.map((b) => ({ n: b.n, ranks: b.ranks, w: 1, at: b.ranks[0]!, pos: 0, arrived: 0 }))
  for (const p of piles) firsts[p.at!] = (firsts[p.at!] ?? 0) + p.n

  const tallies = (): Record<string, number> => {
    const t: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))
    for (const p of piles) if (p.at) t[p.at] = t[p.at]! + p.n * p.w
    for (const id of ids) if (retained[id] !== undefined) t[id] = retained[id]!
    return t
  }
  const hopefuls = () => ids.filter((id) => status[id] === 'hopeful')
  /** Move a pile to its next hopeful ranking, or exhaust it. */
  const advance = (p: Pile, round: number) => {
    for (let i = p.pos + 1; i < p.ranks.length; i++) {
      if (status[p.ranks[i]!] === 'hopeful') {
        p.pos = i
        p.at = p.ranks[i]!
        p.arrived = round
        return
      }
    }
    exhausted += p.n * p.w
    p.at = null
  }
  /** Ascending by tally; ties → fewer first choices → later on the ballot. */
  const weakestFirst = (t: Record<string, number>) =>
    hopefuls().sort(
      (a, b) =>
        t[a]! - t[b]! > EPS ? 1 : t[b]! - t[a]! > EPS ? -1 : firsts[a]! - firsts[b]! || order.get(b)! - order.get(a)!,
    )

  const transferSurplus = (c: string, t: Record<string, number>, round: number): string => {
    const surplus = t[c]! - quota
    retained[c] = system.surplus === 'none' ? t[c]! : quota
    if (surplus <= EPS || system.surplus === 'none') {
      for (const p of piles) if (p.at === c) p.at = null
      return ''
    }
    let mine = piles.filter((p) => p.at === c)
    let base = t[c]!
    if (system.surplus === 'last-parcel') {
      const last = Math.max(...mine.map((p) => p.arrived))
      const parcel = mine.filter((p) => p.arrived === last)
      for (const p of mine) if (p.arrived !== last) p.at = null
      mine = parcel
      base = parcel.reduce((s, p) => s + p.n * p.w, 0)
    }
    let f = Math.min(1, surplus / base)
    if (system.truncate) f = trunc4(f)
    let moved = 0
    for (const p of mine) {
      const nw = system.truncate ? trunc4(p.w * f) : p.w * f
      moved += p.n * nw
      p.w = nw
      advance(p, round)
    }
    lost += Math.max(0, Math.min(surplus, base) - moved) // truncation residue
    if (system.surplus === 'last-parcel' && surplus > base + EPS) {
      retained[c] = t[c]! - base
    }
    return `${c}’s ${fmt(surplus)} extra votes move on at ${f.toFixed(4)} of each ballot’s value`
  }

  const snapshot = (n: number, t: Record<string, number>, elected: string[], eliminated: string[], note: string) =>
    rounds.push({
      n,
      phase: 'STV count',
      tallies: { ...t },
      status: { ...status },
      exhausted,
      lost,
      elected,
      eliminated,
      note,
    })

  let round = 0
  while (winners.length < stvSeats && round < 500) {
    round++
    const t = tallies()
    const seatsLeft = stvSeats - winners.length
    const hs = hopefuls()
    if (!hs.length) break

    // 1. Anyone at or over the threshold is elected.
    const reached = hs
      .filter((c) => t[c]! >= quota - EPS)
      .sort((a, b) => t[b]! - t[a]! || order.get(a)! - order.get(b)!)
      .slice(0, seatsLeft)
    for (const c of reached) {
      status[c] = 'elected'
      winners.push({ id: c, how: 'quota', round, tally: t[c]! })
      pending.push(c)
    }

    // Every seat is filled: stop. The last winners keep their extra votes; with no
    // one left to receive them, moving them on would only count them as run out.
    if (winners.length >= stvSeats) {
      snapshot(round, t, reached, [], `${reached.join(', ')} reach${reached.length > 1 ? '' : 'es'} the threshold`)
      break
    }

    // 2. Transfer surpluses (all at once, or largest first — one per round).
    if (pending.length) {
      pending.sort((a, b) => t[b]! - t[a]!)
      const now = system.surplusOrder === 'simultaneous' ? pending : [pending[0]!]
      pending = pending.filter((c) => !now.includes(c))
      const msgs = now.map((c) => transferSurplus(c, t, round)).filter(Boolean)
      const note = [reached.length ? `${reached.join(', ')} reach${reached.length > 1 ? '' : 'es'} the threshold` : '', ...msgs]
        .filter(Boolean)
        .join('. ')
      snapshot(round, t, reached, [], note || 'No extra votes to move')
      continue
    }

    // 3. Candidates ≤ seats left: the completion rule.
    if (hs.length <= seatsLeft) {
      if (system.completion === 'elect-remaining') {
        for (const c of hs) {
          status[c] = 'elected'
          winners.push({ id: c, how: 'remaining', round, tally: t[c]! })
        }
        snapshot(round, t, hs, [], `${hs.join(', ')} win${hs.length > 1 ? '' : 's'} the remaining seat${hs.length > 1 ? 's' : ''} below the threshold`)
      } else {
        snapshot(round, t, [], [], `No other candidate can reach the threshold. A separate count fills ${seatsLeft} seat${seatsLeft > 1 ? 's' : ''}`)
      }
      break
    }

    // 4. Eliminate.
    const weak = weakestFirst(t)
    let loser = weak[0]!
    let why = `${loser} has the fewest votes and is removed`
    if (weak.length > 1 && Math.abs(t[weak[0]!]! - t[weak[1]!]!) < EPS && system.elimination === 'lowest') {
      ties.push(round)
    }
    const inPlay = piles.filter((p) => p.at && status[p.at] === 'hopeful').map((p) => ({ n: p.n * p.w, ranks: p.ranks }))
    if (system.elimination === 'btr' && weak.length > 1) {
      const [a, b] = [weak[0]!, weak[1]!]
      const [pa, pb] = pairwise(inPlay, a, b)
      if (pa > pb + EPS) loser = b
      why = `${a} and ${b} have the fewest votes. Voters prefer ${a} ${fmt(pa)} to ${fmt(pb)}, so ${loser} is removed`
    } else if (system.elimination === 'borda') {
      const m = hs.length
      const score: Record<string, number> = Object.fromEntries(hs.map((c) => [c, 0]))
      for (const bl of inPlay) {
        let k = 0
        for (const r of bl.ranks) if (status[r] === 'hopeful') score[r] = score[r]! + bl.n * (m - 1 - k++)
      }
      loser = [...weak].sort((a, b) => score[a]! - score[b]!)[0]!
      why = `${loser} has the lowest ranking score (${fmt(score[loser]!)}) and is removed`
    }
    status[loser] = 'eliminated'
    for (const p of piles) {
      if (p.at !== loser) continue
      advance(p, round)
      // Decay only bites ballots that actually had a backup to move to.
      if (system.decay < 1 && p.at !== null) {
        lost += p.n * p.w * (1 - system.decay)
        p.w *= system.decay
      }
    }
    snapshot(round, t, [], [loser], why)
  }

  if (ties.length) {
    notes.push(
      `The tool broke ${ties.length} tie${ties.length > 1 ? 's' : ''} for last place (round${ties.length > 1 ? 's' : ''} ${ties.join(', ')}) by first choices, then by ballot order. Portland draws lots, so its result could differ.`,
    )
  }

  // Fresh, full-value counts for any seats still open.
  const open = seats - winners.length
  if (open > 0) {
    for (let k = 0; k < open; k++) {
      const taken = new Set(winners.map((w) => w.id))
      const field = ids.filter((id) => !taken.has(id))
      if (!field.length) break
      const res = singleWinner(ballots, field, system.finisher, order)
      const label = `Seat ${winners.length + 1}, separate ${system.finisher === 'irv' ? 'instant-runoff' : 'head-to-head'} count`
      for (const r of res.rounds) {
        round++
        const st: Record<string, CandStatus> = Object.fromEntries(ids.map((id) => [id, 'eliminated']))
        for (const w of winners) st[w.id] = 'elected'
        for (const c of Object.keys(r.tallies)) st[c] = 'hopeful'
        rounds.push({
          n: round,
          phase: label,
          tallies: r.tallies,
          status: st,
          exhausted,
          lost,
          elected: r.winner ? [r.winner] : [],
          eliminated: r.out ? [r.out] : [],
          note: r.note,
        })
      }
      winners.push({ id: res.winner, how: 'finisher', round, tally: res.tally })
    }
    notes.push(
      `A separate count filled ${open} seat${open > 1 ? 's' : ''}. Every ballot counted at full value there, so a majority of voters can win each of those seats.`,
    )
  }

  return { winners, rounds, quota: stvSeats > 0 ? quota : null, total, exhausted, lost, notes }
}

// ───────────────────────── single-winner counts ─────────────────────────

interface SWRound {
  tallies: Record<string, number>
  winner?: string
  out?: string
  note: string
}

function singleWinner(
  ballots: Ballot[],
  field: string[],
  rule: 'irv' | 'condorcet',
  order: Map<string, number>,
): { winner: string; tally: number; rounds: SWRound[] } {
  const firstPrefs = (alive: Set<string>) => {
    const t: Record<string, number> = {}
    for (const c of alive) t[c] = 0
    for (const b of ballots) {
      const top = b.ranks.find((r) => alive.has(r))
      if (top) t[top] = t[top]! + b.n
    }
    return t
  }
  if (rule === 'condorcet') {
    const cw = field.find((a) => field.every((b) => a === b || ((p) => p[0] > p[1] + EPS)(pairwise(ballots, a, b))))
    if (cw) {
      const t = firstPrefs(new Set(field))
      return {
        winner: cw,
        tally: t[cw]!,
        rounds: [{ tallies: t, winner: cw, note: `More voters prefer ${cw} to each other candidate. The figures are first choices` }],
      }
    }
  }
  const alive = new Set(field)
  const rounds: SWRound[] = []
  const first = firstPrefs(alive)
  for (;;) {
    const t = firstPrefs(alive)
    const active = Object.values(t).reduce((s, x) => s + x, 0)
    const ranked = [...alive].sort((a, b) => t[b]! - t[a]! || first[b]! - first[a]! || order.get(a)! - order.get(b)!)
    const top = ranked[0]!
    if (t[top]! > active / 2 + EPS || alive.size <= 2) {
      const pre = rule === 'condorcet' && !rounds.length ? 'No candidate beats every rival, so the count uses instant runoff. ' : ''
      rounds.push({ tallies: t, winner: top, note: `${pre}${top} wins with ${fmt(t[top]!)} of ${fmt(active)} continuing ballots` })
      return { winner: top, tally: t[top]!, rounds }
    }
    const out = ranked[ranked.length - 1]!
    alive.delete(out)
    rounds.push({ tallies: t, out, note: `${out} has the fewest votes and is removed` })
  }
}

// ───────────────────────── Meek / Warren ─────────────────────────

function meekCount(ballots: Ballot[], ids: string[], system: System, seats: number, total: number): CountResult {
  const warren = system.meekVariant === 'warren'
  const order = new Map(ids.map((id, i) => [id, i]))
  const status: Record<string, CandStatus> = Object.fromEntries(ids.map((id) => [id, 'hopeful']))
  const keep: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 1]))
  const winners: Winner[] = []
  const rounds: Round[] = []
  let quota = total / (seats + 1)
  let excess = 0
  let t: Record<string, number> = {}

  const distribute = () => {
    t = Object.fromEntries(ids.map((id) => [id, 0]))
    excess = 0
    for (const b of ballots) {
      let r = 1
      for (const c of b.ranks) {
        if (status[c] === 'eliminated') continue
        const give = warren ? Math.min(r, keep[c]!) : r * keep[c]!
        t[c] = t[c]! + b.n * give
        r -= give
        if (r < 1e-12) break
      }
      excess += b.n * Math.max(0, r)
    }
    quota = (total - excess) / (seats + 1)
  }
  const settle = () => {
    for (let i = 0; i < 2000; i++) {
      distribute()
      let worst = 0
      for (const c of ids) {
        if (status[c] !== 'elected' || t[c]! <= 0) continue
        worst = Math.max(worst, Math.abs(t[c]! - quota))
        keep[c] = Math.min(1, keep[c]! * (quota / t[c]!))
      }
      if (worst < 1e-7 * Math.max(1, total)) break
    }
    distribute()
  }

  let round = 0
  while (winners.length < seats && round < 500) {
    round++
    settle()
    const hs = ids.filter((id) => status[id] === 'hopeful')
    const snap = (elected: string[], eliminated: string[], note: string) =>
      rounds.push({
        n: round,
        phase: warren ? 'Warren count' : 'Meek count',
        tallies: { ...t },
        status: { ...status },
        exhausted: excess,
        lost: 0,
        elected,
        eliminated,
        note,
      })
    const seatsLeft = seats - winners.length
    const reached = hs
      .filter((c) => t[c]! >= quota - 1e-7)
      .sort((a, b) => t[b]! - t[a]!)
      .slice(0, seatsLeft)
    if (reached.length) {
      snap(reached, [], `${reached.join(', ')} reach${reached.length > 1 ? '' : 'es'} the threshold (${fmt(quota)}). The count shares their ballots again`)
      for (const c of reached) {
        status[c] = 'elected'
        winners.push({ id: c, how: 'quota', round, tally: t[c]! })
      }
      continue
    }
    if (hs.length <= seatsLeft) {
      snap(hs, [], `${hs.join(', ')} win${hs.length > 1 ? '' : 's'} the remaining seat${hs.length > 1 ? 's' : ''}`)
      for (const c of hs) {
        status[c] = 'elected'
        winners.push({ id: c, how: 'remaining', round, tally: t[c]! })
      }
      break
    }
    const loser = [...hs].sort((a, b) => t[a]! - t[b]! || order.get(b)! - order.get(a)!)[0]!
    snap([], [loser], `${loser} has the fewest votes and is removed. The count starts again without them`)
    status[loser] = 'eliminated'
    keep[loser] = 0
  }
  settle()
  return {
    winners,
    rounds,
    quota,
    total,
    exhausted: excess,
    lost: 0,
    notes: [`The threshold falls as ballots run out of choices. It ended at ${fmt(quota)}, which is ${((quota / total) * 100).toFixed(1)}% of all ballots.`],
  }
}

// ───────────────────────── MCPC ─────────────────────────

const HARMONIC = [0, 1, 1.5, 1.8333333333, 2.0833333333, 2.2833333333, 2.45, 2.5928571429]
const harmonic = (k: number) => HARMONIC[k] ?? HARMONIC[HARMONIC.length - 1]! + (k - 7) * 0.12

function mcpcCount(ballots: Ballot[], ids: string[], system: System, seats: number, total: number): CountResult {
  const depth = Math.max(1, system.consentDepth)
  const idx = new Map(ids.map((id, i) => [id, i]))
  // Per ballot: consented candidate indices + their rank (1-based).
  const tops = ballots.map((b) => ({ n: b.n, c: b.ranks.slice(0, depth).map((r) => idx.get(r)!) }))
  const share = ids.map(() => 0)
  for (const b of tops) for (const c of b.c) share[c] = share[c]! + b.n / total
  const sorted = [...share].sort((a, b) => b - a)
  const feasible = sorted[seats - 1] ?? 0
  const asked = system.mandate
  const mu = Math.min(asked, feasible)
  const pool = ids.map((_, i) => i).filter((i) => share[i]! >= mu - EPS)
  const notes: string[] = []
  if (asked > feasible + EPS) {
    notes.push(
      `No group of ${seats} winners meets the ${(asked * 100).toFixed(1)}% support you set. The tool lowered it to ${(feasible * 100).toFixed(1)}%, the highest these candidates can meet.`,
    )
  }

  const score = (set: number[]): [number, number] => {
    const inSet = new Set(set)
    let R = 0
    let S = 0
    for (const b of tops) {
      let k = 0
      for (let j = 0; j < b.c.length; j++) {
        if (inSet.has(b.c[j]!)) {
          k++
          S += b.n / (j + 1)
        }
      }
      R += b.n * harmonic(k)
    }
    return [R, S]
  }
  const better = (a: [number, number], b: [number, number]) => a[0] > b[0] + 1e-6 || (Math.abs(a[0] - b[0]) <= 1e-6 && a[1] > b[1] + 1e-6)

  let best: number[] = []
  let bestScore: [number, number] = [-1, -1]
  const combos = binom(pool.length, seats)
  if (combos <= 60000) {
    const pick: number[] = []
    const rec = (start: number) => {
      if (pick.length === seats) {
        const s = score(pick)
        if (better(s, bestScore)) {
          bestScore = s
          best = [...pick]
        }
        return
      }
      for (let i = start; i <= pool.length - (seats - pick.length); i++) {
        pick.push(pool[i]!)
        rec(i + 1)
        pick.pop()
      }
    }
    rec(0)
  } else {
    // Too many committees to enumerate: build greedily (sequential PAV).
    notes.push('There are too many candidates to test every group. The tool built the group one seat at a time.')
    while (best.length < seats) {
      let add = -1
      let s: [number, number] = [-1, -1]
      for (const c of pool) {
        if (best.includes(c)) continue
        const sc = score([...best, c])
        if (better(sc, s)) {
          s = sc
          add = c
        }
      }
      best.push(add)
      bestScore = s
    }
  }

  const winners: Winner[] = best
    .sort((a, b) => share[b]! - share[a]!)
    .map((i) => ({ id: ids[i]!, how: 'committee' as const, round: 1, tally: share[i]! * total }))
  const reps = tops.reduce((s, b) => s + (b.c.some((c) => best.includes(c)) ? b.n : 0), 0)
  notes.push(
    `A voter supports the candidates in their top ${depth}. ${((reps / total) * 100).toFixed(1)}% of voters support at least one winner.`,
  )
  const status: Record<string, CandStatus> = Object.fromEntries(ids.map((id) => [id, 'hopeful']))
  const round: Round = {
    n: 1,
    phase: 'Support count',
    tallies: Object.fromEntries(ids.map((id, i) => [id, share[i]! * total])),
    status,
    exhausted: 0,
    lost: 0,
    elected: winners.map((w) => w.id),
    eliminated: [],
    note: `The figures are voters who rank each candidate in their top ${depth}. Each winner needs ${(mu * 100).toFixed(1)}%, which is ${fmt(mu * total)} voters`,
  }
  return {
    winners,
    rounds: [round],
    quota: mu * total,
    total,
    exhausted: 0,
    lost: 0,
    notes,
    consent: ids.map((id, i) => ({ id, share: share[i]!, qualifies: share[i]! >= mu - EPS })),
  }
}

function binom(n: number, k: number): number {
  if (k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

// ───────────────────────── SNTV baseline ─────────────────────────

function sntvCount(ballots: Ballot[], ids: string[], seats: number, total: number): CountResult {
  const t: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))
  for (const b of ballots) t[b.ranks[0]!] = t[b.ranks[0]!]! + b.n
  const top = [...ids].sort((a, b) => t[b]! - t[a]!).slice(0, seats)
  return {
    winners: top.map((id) => ({ id, how: 'plurality', round: 1, tally: t[id]! })),
    rounds: [
      {
        n: 1,
        phase: 'First choices',
        tallies: t,
        status: Object.fromEntries(ids.map((id) => [id, 'hopeful'])),
        exhausted: 0,
        lost: 0,
        elected: top,
        eliminated: [],
        note: `The ${seats} candidate${seats > 1 ? 's' : ''} with the most first choices win${seats > 1 ? '' : 's'}. The count ignores later choices`,
      },
    ],
    quota: null,
    total,
    exhausted: 0,
    lost: 0,
    notes: [],
  }
}

function fmt(x: number): string {
  return Math.abs(x - Math.round(x)) < 1e-6 ? String(Math.round(x)) : x.toFixed(2)
}
