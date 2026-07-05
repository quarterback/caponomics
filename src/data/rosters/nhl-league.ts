import { buildLeague } from './build'
import { genTeam, NHL_OPTS } from './generate'

// Full 32-team NHL, generated. Tight band between the ~$68M floor and ~$92.4M
// ceiling, so most teams sit close to the cap — a good stress test for floors.
const teams = (
  [
    ['BOS', 'Boston Bruins', 90_000_000],
    ['BUF', 'Buffalo Sabres', 78_000_000],
    ['DET', 'Detroit Red Wings', 84_000_000],
    ['FLA', 'Florida Panthers', 94_000_000],
    ['MTL', 'Montreal Canadiens', 76_000_000],
    ['OTT', 'Ottawa Senators', 82_000_000],
    ['TB', 'Tampa Bay Lightning', 92_000_000],
    ['TOR', 'Toronto Maple Leafs', 93_000_000],
    ['CAR', 'Carolina Hurricanes', 89_000_000],
    ['CBJ', 'Columbus Blue Jackets', 72_000_000],
    ['NJ', 'New Jersey Devils', 88_000_000],
    ['NYI', 'New York Islanders', 85_000_000],
    ['NYR', 'New York Rangers', 92_000_000],
    ['PHI', 'Philadelphia Flyers', 74_000_000],
    ['PIT', 'Pittsburgh Penguins', 90_000_000],
    ['WSH', 'Washington Capitals', 87_000_000],
    ['CHI', 'Chicago Blackhawks', 66_000_000],
    ['COL', 'Colorado Avalanche', 93_000_000],
    ['DAL', 'Dallas Stars', 91_000_000],
    ['MIN', 'Minnesota Wild', 86_000_000],
    ['NSH', 'Nashville Predators', 84_000_000],
    ['STL', 'St. Louis Blues', 83_000_000],
    ['WPG', 'Winnipeg Jets', 88_000_000],
    ['ARI', 'Utah Hockey Club', 70_000_000],
    ['ANA', 'Anaheim Ducks', 69_000_000],
    ['CGY', 'Calgary Flames', 82_000_000],
    ['EDM', 'Edmonton Oilers', 93_000_000],
    ['LA', 'Los Angeles Kings', 89_000_000],
    ['SJ', 'San Jose Sharks', 67_000_000],
    ['SEA', 'Seattle Kraken', 84_000_000],
    ['VAN', 'Vancouver Canucks', 90_000_000],
    ['VGK', 'Vegas Golden Knights', 95_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 5300 + i * 151, NHL_OPTS))

export const nhlLeague = buildLeague({
  id: 'nhl-league',
  name: 'NHL — all 32 teams',
  sport: 'hockey',
  year: 2026,
  teams,
})
