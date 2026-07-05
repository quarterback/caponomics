import { buildLeague } from './build'
import { genTeam, CFL_OPTS, ALEAGUE_OPTS, IPL_OPTS } from './generate'

// CFL — a hard salary cap around CA$5.4M per team.
const cflTeams = (
  [
    ['BC', 'BC Lions', 5_300_000],
    ['CGY', 'Calgary Stampeders', 5_350_000],
    ['EDM', 'Edmonton Elks', 5_200_000],
    ['SSK', 'Saskatchewan Roughriders', 5_400_000],
    ['WPG', 'Winnipeg Blue Bombers', 5_380_000],
    ['HAM', 'Hamilton Tiger-Cats', 5_250_000],
    ['TOR', 'Toronto Argonauts', 5_300_000],
    ['OTT', 'Ottawa Redblacks', 5_150_000],
    ['MTL', 'Montreal Alouettes', 5_320_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 7100 + i * 83, CFL_OPTS))

export const cflLeague = buildLeague({
  id: 'cfl-league',
  name: 'CFL — 9 teams',
  sport: 'football',
  currency: 'CAD',
  year: 2026,
  teams: cflTeams,
})

// A-League (Australia) — a salary cap around AU$2.55M plus marquee exceptions, so
// the biggest clubs run well over.
const aleagueTeams = (
  [
    ['ADL', 'Adelaide United', 2_500_000],
    ['BRI', 'Brisbane Roar', 2_450_000],
    ['CCM', 'Central Coast Mariners', 2_400_000],
    ['MCY', 'Melbourne City', 3_600_000],
    ['MVC', 'Melbourne Victory', 3_400_000],
    ['NEW', 'Newcastle Jets', 2_350_000],
    ['PER', 'Perth Glory', 2_500_000],
    ['SYD', 'Sydney FC', 3_500_000],
    ['WSW', 'Western Sydney Wanderers', 2_900_000],
    ['WEL', 'Wellington Phoenix', 2_450_000],
    ['MAC', 'Macarthur FC', 2_400_000],
    ['WUN', 'Western United', 2_550_000],
    ['AUC', 'Auckland FC', 2_800_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 7500 + i * 89, ALEAGUE_OPTS))

export const aLeague = buildLeague({
  id: 'aleague-au',
  name: 'A-League (Australia) — 13 clubs',
  sport: 'soccer',
  currency: 'AUD',
  year: 2026,
  teams: aleagueTeams,
})

// IPL cricket — an auction purse (~₹120 crore) rather than a wage cap. Squad
// spend in rupees; salaries render in crore.
const iplTeams = (
  [
    ['CSK', 'Chennai Super Kings', 1_180_000_000],
    ['MI', 'Mumbai Indians', 1_200_000_000],
    ['RCB', 'Royal Challengers Bengaluru', 1_150_000_000],
    ['KKR', 'Kolkata Knight Riders', 1_170_000_000],
    ['SRH', 'Sunrisers Hyderabad', 1_120_000_000],
    ['DC', 'Delhi Capitals', 1_140_000_000],
    ['RR', 'Rajasthan Royals', 1_100_000_000],
    ['PBKS', 'Punjab Kings', 1_090_000_000],
    ['GT', 'Gujarat Titans', 1_160_000_000],
    ['LSG', 'Lucknow Super Giants', 1_130_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 7900 + i * 97, IPL_OPTS))

export const iplLeague = buildLeague({
  id: 'ipl-league',
  name: 'IPL cricket — 10 teams',
  sport: 'cricket',
  currency: 'INR',
  year: 2026,
  teams: iplTeams,
})
