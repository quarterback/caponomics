// Readouts computed from the ballots + the winning set — independent of how
// the count got there, so every system is judged on the same yardsticks.

import { cleanBallots, pairwise } from './count'
import type { CountResult, Profile } from './types'

export interface CandidateSupport {
  id: string
  first: number
  top3: number
  any: number
}

export interface Upset {
  loser: string
  winner: string
  forLoser: number
  forWinner: number
}

export interface CampRow {
  camp: string
  voteShare: number
  seats: number
}

export interface Metrics {
  support: CandidateSupport[]
  /** Smallest top-3 support among winners — the weakest mandate seated. */
  minMandate: number
  weakest: string | null
  /** Voters whose first choice won. */
  firstChoiceWon: number
  /** Voters who ranked at least one winner anywhere. */
  represented: number
  /** Vote value that ended up behind no one (exhausted + destroyed by rule). */
  inactive: number
  belowQuota: string[]
  upsets: Upset[]
  camps: CampRow[]
}

export function computeMetrics(profile: Profile, result: CountResult): Metrics {
  const ballots = cleanBallots(profile)
  const total = result.total || 1
  const win = new Set(result.winners.map((w) => w.id))
  const sup = new Map(profile.candidates.map((c) => [c.id, { id: c.id, first: 0, top3: 0, any: 0 }]))
  let firstChoiceWon = 0
  let represented = 0
  const campVotes = new Map<string, number>()
  const campOf = new Map(profile.candidates.map((c) => [c.id, c.camp]))
  for (const b of ballots) {
    b.ranks.forEach((r, i) => {
      const s = sup.get(r)!
      if (i === 0) s.first += b.n
      if (i < 3) s.top3 += b.n
      s.any += b.n
    })
    if (win.has(b.ranks[0]!)) firstChoiceWon += b.n
    if (b.ranks.some((r) => win.has(r))) represented += b.n
    const camp = campOf.get(b.ranks[0]!)
    if (camp) campVotes.set(camp, (campVotes.get(camp) ?? 0) + b.n)
  }
  const support = [...sup.values()].map((s) => ({ id: s.id, first: s.first / total, top3: s.top3 / total, any: s.any / total }))
  const winSupport = support.filter((s) => win.has(s.id)).sort((a, b) => a.top3 - b.top3)

  const upsets: Upset[] = []
  for (const c of profile.candidates) {
    if (win.has(c.id)) continue
    for (const w of result.winners) {
      const [l, ww] = pairwise(ballots, c.id, w.id)
      if (l > ww + 1e-9) upsets.push({ loser: c.id, winner: w.id, forLoser: l, forWinner: ww })
    }
  }
  upsets.sort((a, b) => b.forLoser - b.forWinner - (a.forLoser - a.forWinner))

  const camps: CampRow[] = [...campVotes.entries()]
    .map(([camp, v]) => ({
      camp,
      voteShare: v / total,
      seats: result.winners.filter((w) => campOf.get(w.id) === camp).length,
    }))
    .sort((a, b) => b.voteShare - a.voteShare)

  return {
    support,
    minMandate: winSupport[0]?.top3 ?? 0,
    weakest: winSupport[0]?.id ?? null,
    firstChoiceWon: firstChoiceWon / total,
    represented: represented / total,
    inactive: (result.exhausted + result.lost) / total,
    belowQuota: result.winners.filter((w) => w.how === 'remaining').map((w) => w.id),
    upsets,
    camps,
  }
}
