import { buildLeague } from './build'
import { genTeam, NFL_OPTS } from './generate'

// Full 32-team NFL, generated. Cap hits are input data (no proration modeled),
// so payrolls cluster near the cap the way real NFL books do.
const teams = (
  [
    ['BUF', 'Buffalo Bills', 258_000_000],
    ['MIA', 'Miami Dolphins', 246_000_000],
    ['NE', 'New England Patriots', 234_000_000],
    ['NYJ', 'New York Jets', 252_000_000],
    ['BAL', 'Baltimore Ravens', 260_000_000],
    ['CIN', 'Cincinnati Bengals', 256_000_000],
    ['CLE', 'Cleveland Browns', 262_000_000],
    ['PIT', 'Pittsburgh Steelers', 244_000_000],
    ['HOU', 'Houston Texans', 240_000_000],
    ['IND', 'Indianapolis Colts', 238_000_000],
    ['JAX', 'Jacksonville Jaguars', 248_000_000],
    ['TEN', 'Tennessee Titans', 232_000_000],
    ['DEN', 'Denver Broncos', 250_000_000],
    ['KC', 'Kansas City Chiefs', 259_000_000],
    ['LV', 'Las Vegas Raiders', 236_000_000],
    ['LAC', 'Los Angeles Chargers', 247_000_000],
    ['DAL', 'Dallas Cowboys', 264_000_000],
    ['NYG', 'New York Giants', 242_000_000],
    ['PHI', 'Philadelphia Eagles', 261_000_000],
    ['WAS', 'Washington Commanders', 245_000_000],
    ['CHI', 'Chicago Bears', 235_000_000],
    ['DET', 'Detroit Lions', 257_000_000],
    ['GB', 'Green Bay Packers', 249_000_000],
    ['MIN', 'Minnesota Vikings', 243_000_000],
    ['ATL', 'Atlanta Falcons', 241_000_000],
    ['CAR', 'Carolina Panthers', 230_000_000],
    ['NO', 'New Orleans Saints', 266_000_000],
    ['TB', 'Tampa Bay Buccaneers', 246_000_000],
    ['ARI', 'Arizona Cardinals', 233_000_000],
    ['LAR', 'Los Angeles Rams', 254_000_000],
    ['SF', 'San Francisco 49ers', 260_000_000],
    ['SEA', 'Seattle Seahawks', 244_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 2600 + i * 149, NFL_OPTS))

export const nflLeague = buildLeague({
  id: 'nfl-league',
  name: 'NFL — all 32 teams',
  sport: 'football',
  year: 2026,
  teams,
})
