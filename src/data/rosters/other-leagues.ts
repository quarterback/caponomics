import { buildLeague } from './build'
import { genTeam, CFL_OPTS, ALEAGUE_OPTS, IPL_OPTS, KBO_OPTS, NPB_OPTS } from './generate'

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

// KBO (Korea) — soft cap on top-40 salaries (~₩11.4B). Targets in won; some
// clubs run over the cap.
const kboTeams = (
  [
    ['LG', 'LG Twins', 13_000_000_000],
    ['KIA', 'KIA Tigers', 12_500_000_000],
    ['SSG', 'SSG Landers', 11_800_000_000],
    ['DOO', 'Doosan Bears', 11_500_000_000],
    ['SAM', 'Samsung Lions', 11_000_000_000],
    ['LOT', 'Lotte Giants', 10_500_000_000],
    ['KT', 'KT Wiz', 10_000_000_000],
    ['NC', 'NC Dinos', 9_500_000_000],
    ['HAN', 'Hanwha Eagles', 9_000_000_000],
    ['KIW', 'Kiwoom Heroes', 6_000_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 8300 + i * 101, KBO_OPTS))

export const kboLeague = buildLeague({
  id: 'kbo-league',
  name: 'KBO baseball — 10 teams',
  sport: 'baseball',
  currency: 'KRW',
  year: 2026,
  teams: kboTeams,
})

// NPB (Japan) — no salary cap. Targets are estimated payrolls in yen.
const npbTeams = (
  [
    ['YOG', 'Yomiuri Giants', 6_500_000_000],
    ['SFB', 'SoftBank Hawks', 6_200_000_000],
    ['HAN', 'Hanshin Tigers', 4_500_000_000],
    ['ORX', 'Orix Buffaloes', 4_000_000_000],
    ['DNA', 'DeNA BayStars', 3_800_000_000],
    ['CHU', 'Chunichi Dragons', 3_500_000_000],
    ['RAK', 'Rakuten Eagles', 3_500_000_000],
    ['LOT', 'Lotte Marines', 3_300_000_000],
    ['YAK', 'Yakult Swallows', 3_200_000_000],
    ['SEI', 'Seibu Lions', 3_000_000_000],
    ['HIR', 'Hiroshima Carp', 3_000_000_000],
    ['NIP', 'Nippon-Ham Fighters', 2_600_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 8700 + i * 103, NPB_OPTS))

export const npbLeague = buildLeague({
  id: 'npb-league',
  name: 'NPB baseball — 12 teams',
  sport: 'baseball',
  currency: 'JPY',
  year: 2026,
  teams: npbTeams,
})
