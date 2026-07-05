import type { League } from '../../engine/types'
import { mlbSample } from './mlb-sample'
import { nbaSample } from './nba-sample'
import { nflLeague } from './nfl-league'
import { nhlLeague } from './nhl-league'

export { mlbSample } from './mlb-sample'
export { nbaSample } from './nba-sample'
export { nflLeague } from './nfl-league'
export { nhlLeague } from './nhl-league'

export interface RosterOption {
  id: string
  label: string
  league: League
}

/** Full leagues to test a cap system against. Any league runs against any
 *  ruleset — the point is to see how a cap plays out across an entire league. */
export const ROSTERS: RosterOption[] = [
  { id: 'mlb-sample', label: 'MLB · 30 teams', league: mlbSample },
  { id: 'nba-sample', label: 'NBA · 30 teams', league: nbaSample },
  { id: 'nfl-league', label: 'NFL · 32 teams', league: nflLeague },
  { id: 'nhl-league', label: 'NHL · 32 teams', league: nhlLeague },
]

export const ROSTER_MAP: Record<string, RosterOption> = Object.fromEntries(
  ROSTERS.map((r) => [r.id, r]),
)
