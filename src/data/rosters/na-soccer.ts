import { buildLeague } from './build'
import { genTeam, MLS_OPTS, NWSL_OPTS } from './generate'

// MLS — a salary budget plus allocation money and Designated Players, so total
// roster spend varies wildly. Targets are total wage bills (USD).
const mlsTeams = (
  [
    ['ATL', 'Atlanta United', 22_000_000],
    ['ATX', 'Austin FC', 16_000_000],
    ['CLT', 'Charlotte FC', 14_000_000],
    ['CHI', 'Chicago Fire', 18_000_000],
    ['CIN', 'FC Cincinnati', 20_000_000],
    ['COL', 'Colorado Rapids', 12_000_000],
    ['CLB', 'Columbus Crew', 17_000_000],
    ['DAL', 'FC Dallas', 13_000_000],
    ['DC', 'D.C. United', 15_000_000],
    ['HOU', 'Houston Dynamo', 13_000_000],
    ['LA', 'LA Galaxy', 24_000_000],
    ['LAFC', 'Los Angeles FC', 26_000_000],
    ['MIA', 'Inter Miami', 40_000_000],
    ['MIN', 'Minnesota United', 14_000_000],
    ['MTL', 'CF Montréal', 11_000_000],
    ['NSH', 'Nashville SC', 16_000_000],
    ['NE', 'New England Revolution', 14_000_000],
    ['NYC', 'New York City FC', 19_000_000],
    ['RBNY', 'New York Red Bulls', 15_000_000],
    ['ORL', 'Orlando City', 18_000_000],
    ['PHI', 'Philadelphia Union', 13_000_000],
    ['POR', 'Portland Timbers', 15_000_000],
    ['RSL', 'Real Salt Lake', 12_000_000],
    ['SD', 'San Diego FC', 17_000_000],
    ['SJ', 'San Jose Earthquakes', 12_000_000],
    ['SEA', 'Seattle Sounders', 20_000_000],
    ['SKC', 'Sporting Kansas City', 14_000_000],
    ['STL', 'St. Louis City', 16_000_000],
    ['TOR', 'Toronto FC', 21_000_000],
    ['VAN', 'Vancouver Whitecaps', 12_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 6100 + i * 71, MLS_OPTS))

export const mlsLeague = buildLeague({
  id: 'mls-league',
  name: 'MLS — 30 teams',
  sport: 'soccer',
  currency: 'USD',
  year: 2026,
  teams: mlsTeams,
})

// NWSL — salary cap plus allocation money. Targets are total spend (USD).
const nwslTeams = (
  [
    ['ANG', 'Angel City FC', 4_400_000],
    ['BAY', 'Bay FC', 4_000_000],
    ['CHI', 'Chicago Stars', 3_800_000],
    ['HOU', 'Houston Dash', 3_700_000],
    ['KC', 'Kansas City Current', 4_600_000],
    ['LOU', 'Racing Louisville', 3_500_000],
    ['NJ', 'NJ/NY Gotham FC', 4_500_000],
    ['NC', 'North Carolina Courage', 4_100_000],
    ['ORL', 'Orlando Pride', 4_300_000],
    ['POR', 'Portland Thorns', 4_200_000],
    ['SD', 'San Diego Wave', 4_100_000],
    ['SEA', 'Seattle Reign', 3_600_000],
    ['UTA', 'Utah Royals', 3_400_000],
    ['WAS', 'Washington Spirit', 4_200_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 6700 + i * 73, NWSL_OPTS))

export const nwslLeague = buildLeague({
  id: 'nwsl-league',
  name: 'NWSL — 14 teams',
  sport: 'soccer',
  currency: 'USD',
  year: 2026,
  teams: nwslTeams,
})
