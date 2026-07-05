import { buildLeague } from './build'
import { genTeam, WNBA_OPTS, PWHL_OPTS } from './generate'

// WNBA — hard team cap ~$1.5M. Small numbers; a good scale test.
const wnbaTeams = (
  [
    ['ATL', 'Atlanta Dream', 1_460_000],
    ['CHI', 'Chicago Sky', 1_420_000],
    ['CONN', 'Connecticut Sun', 1_480_000],
    ['DAL', 'Dallas Wings', 1_400_000],
    ['IND', 'Indiana Fever', 1_490_000],
    ['LV', 'Las Vegas Aces', 1_500_000],
    ['LA', 'Los Angeles Sparks', 1_380_000],
    ['MIN', 'Minnesota Lynx', 1_470_000],
    ['NY', 'New York Liberty', 1_500_000],
    ['PHX', 'Phoenix Mercury', 1_450_000],
    ['SEA', 'Seattle Storm', 1_460_000],
    ['WAS', 'Washington Mystics', 1_360_000],
    ['GS', 'Golden State Valkyries', 1_340_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 9100 + i * 61, WNBA_OPTS))

export const wnbaLeague = buildLeague({
  id: 'wnba-league',
  name: 'WNBA — 13 teams',
  sport: 'basketball',
  currency: 'USD',
  year: 2026,
  teams: wnbaTeams,
})

// PWHL — a young women's hockey league with a simple hard team-salary cap.
const pwhlTeams = (
  [
    ['BOS', 'Boston Fleet', 1_480_000],
    ['MIN', 'Minnesota Frost', 1_500_000],
    ['MTL', 'Montréal Victoire', 1_470_000],
    ['NY', 'New York Sirens', 1_420_000],
    ['OTT', 'Ottawa Charge', 1_450_000],
    ['TOR', 'Toronto Sceptres', 1_490_000],
    ['SEA', 'Seattle Torrent', 1_380_000],
    ['VAN', 'Vancouver Goldeneyes', 1_360_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 9500 + i * 67, PWHL_OPTS))

export const pwhlLeague = buildLeague({
  id: 'pwhl-league',
  name: 'PWHL — 8 teams',
  sport: 'hockey',
  currency: 'USD',
  year: 2026,
  teams: pwhlTeams,
})
