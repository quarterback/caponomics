import type { League } from '../../engine/types'
import { mlbSample } from './mlb-sample'
import { nbaSample } from './nba-sample'

export { mlbSample } from './mlb-sample'
export { nbaSample } from './nba-sample'

export interface RosterOption {
  id: string
  label: string
  league: League
}

/** Sample rosters offered in the roster loader. Any roster runs against any
 *  ruleset, so these are just starting points. */
export const ROSTERS: RosterOption[] = [
  { id: 'mlb-sample', label: 'MLB — 4 teams', league: mlbSample },
  { id: 'nba-sample', label: 'NBA — 3 teams', league: nbaSample },
]

export const ROSTER_MAP: Record<string, RosterOption> = Object.fromEntries(
  ROSTERS.map((r) => [r.id, r]),
)
