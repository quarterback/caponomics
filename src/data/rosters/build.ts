import type { Currency } from '../../engine/format'
import type { Contract, League, Player } from '../../engine/types'

export interface StarInput {
  name: string
  pos: string
  salary: number
  service?: number
}
export interface TeamInput {
  id: string
  name: string
  stars: StarInput[]
  /** Fill the roster with minimum-salary players up to this count. */
  fillTo?: number
  fillSalary?: number
}
export interface RosterFixtureInput {
  id: string
  name: string
  sport: string
  currency?: Currency
  year: number
  teams: TeamInput[]
}

/** Turn compact roster input into a full League, generating filler players so
 *  roster counts are realistic without hand-listing every bench spot. */
export function buildLeague(input: RosterFixtureInput): League {
  const players: Record<string, Player> = {}
  const teams = input.teams.map((t) => {
    const roster: Contract[] = []
    let n = 0
    const add = (name: string, pos: string, salary: number, service: number) => {
      const id = `${t.id}-${slug(name)}-${n++}`
      players[id] = { id, name, pos, serviceYears: service }
      roster.push({ id: `c-${id}`, playerId: id, years: [input.year], salaryByYear: { [input.year]: salary } })
    }
    for (const s of t.stars) add(s.name, s.pos, s.salary, s.service ?? 5)
    const fillTo = t.fillTo ?? t.stars.length
    const fillSalary = t.fillSalary ?? 780_000
    let k = 1
    while (roster.length < fillTo) add(`Reserve ${k++}`, 'R', fillSalary, 1)
    return { id: t.id, name: t.name, roster, flags: [] }
  })
  return {
    id: input.id,
    name: input.name,
    sport: input.sport,
    currency: input.currency ?? 'USD',
    players,
    teams,
    seasonYears: [input.year],
  }
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** Look up a player id by (teamId, name substring) — handy for presets that need
 *  to designate a cornerstone by name rather than a generated id. */
export function findPlayerId(league: League, teamId: string, nameContains: string): string | undefined {
  const t = league.teams.find((x) => x.id === teamId)
  if (!t) return undefined
  const needle = nameContains.toLowerCase()
  const c = t.roster.find((c) => league.players[c.playerId]?.name.toLowerCase().includes(needle))
  return c?.playerId
}
