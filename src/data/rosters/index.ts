import type { League } from '../../engine/types'
import { mlbSample } from './mlb-sample'
import { nbaSample } from './nba-sample'
import { nflLeague } from './nfl-league'
import { nhlLeague } from './nhl-league'
import { wnbaLeague, pwhlLeague } from './women-leagues'
import { mlsLeague, nwslLeague } from './na-soccer'
import { eplLeague, laLigaLeague, serieALeague, bundesligaLeague, ligue1League } from './euro-soccer'
import { cflLeague, aLeague, iplLeague, kboLeague, npbLeague } from './other-leagues'

export { mlbSample } from './mlb-sample'
export { nbaSample } from './nba-sample'

export interface RosterOption {
  id: string
  label: string
  group: string
  league: League
}

/** Every full league you can test a cap system against. Any league runs against
 *  any ruleset — the point is to see how a cap plays out across a whole league,
 *  at any scale or currency. */
export const ROSTERS: RosterOption[] = [
  { id: 'mlb-sample', label: 'MLB · 30', group: 'North America', league: mlbSample },
  { id: 'nba-sample', label: 'NBA · 30', group: 'North America', league: nbaSample },
  { id: 'nfl-league', label: 'NFL · 32', group: 'North America', league: nflLeague },
  { id: 'nhl-league', label: 'NHL · 32', group: 'North America', league: nhlLeague },
  { id: 'wnba-league', label: 'WNBA · 13', group: 'North America', league: wnbaLeague },
  { id: 'mls-league', label: 'MLS · 30', group: 'North America', league: mlsLeague },
  { id: 'nwsl-league', label: 'NWSL · 14', group: 'North America', league: nwslLeague },
  { id: 'pwhl-league', label: 'PWHL · 8', group: 'North America', league: pwhlLeague },
  { id: 'cfl-league', label: 'CFL · 9', group: 'North America', league: cflLeague },
  { id: 'epl-league', label: 'Premier League · 20', group: 'Europe', league: eplLeague },
  { id: 'laliga-league', label: 'La Liga · 20', group: 'Europe', league: laLigaLeague },
  { id: 'seriea-league', label: 'Serie A · 20', group: 'Europe', league: serieALeague },
  { id: 'bundesliga-league', label: 'Bundesliga · 18', group: 'Europe', league: bundesligaLeague },
  { id: 'ligue1-league', label: 'Ligue 1 · 18', group: 'Europe', league: ligue1League },
  { id: 'kbo-league', label: 'KBO · 10', group: 'Asia', league: kboLeague },
  { id: 'npb-league', label: 'NPB · 12', group: 'Asia', league: npbLeague },
  { id: 'ipl-league', label: 'IPL cricket · 10', group: 'Asia', league: iplLeague },
  { id: 'aleague-au', label: 'A-League · 13', group: 'Rest of world', league: aLeague },
]

export const ROSTER_MAP: Record<string, RosterOption> = Object.fromEntries(
  ROSTERS.map((r) => [r.id, r]),
)

/** Roster groups in display order. */
export const ROSTER_GROUPS = ['North America', 'Europe', 'Asia', 'Rest of world']
