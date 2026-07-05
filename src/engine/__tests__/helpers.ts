// Test helpers for building minimal leagues/rulesets.
import type { League, ModuleInstance, Ruleset, Contract, Player } from '../types'

export function player(id: string, serviceYears = 5, pos = 'X'): Player {
  return { id, name: id, pos, serviceYears }
}

export function contract(playerId: string, salary: number, year = 2026): Contract {
  return { id: `c-${playerId}`, playerId, years: [year], salaryByYear: { [year]: salary } }
}

/** One team whose roster is a list of [playerId, salary, serviceYears?]. */
export function oneTeamLeague(
  players: [string, number, number?][],
  year = 2026,
): League {
  const playerMap: Record<string, Player> = {}
  const roster: Contract[] = []
  for (const [id, salary, service] of players) {
    playerMap[id] = player(id, service ?? 5)
    roster.push(contract(id, salary, year))
  }
  return {
    id: 'test',
    name: 'Test League',
    players: playerMap,
    teams: [{ id: 't1', name: 'Team One', roster, flags: [] }],
    seasonYears: [year],
  }
}

export function mod(kind: string, params: Record<string, unknown> = {}, enabled = true): ModuleInstance {
  return { id: `${kind}-1`, kind, enabled, params }
}

export function ruleset(modules: ModuleInstance[], year = 2026): Ruleset {
  return { schemaVersion: 1, id: 'r', name: 'R', seasonYears: [year], modules }
}
