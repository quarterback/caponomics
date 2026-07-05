import { buildLeague } from './build'
import { genTeam, NBA_OPTS } from './generate'

// The rest of the league. Every team clears ~$100M (so any of them lands over a
// hockey-sized hard cap in a remix); rebuilders sit below the NBA floor.
const generatedTeams = (
  [
    ['MIL', 'Milwaukee Bucks', 196_000_000],
    ['CLE', 'Cleveland Cavaliers', 206_000_000],
    ['IND', 'Indiana Pacers', 176_000_000],
    ['ORL', 'Orlando Magic', 166_000_000],
    ['MIA', 'Miami Heat', 190_000_000],
    ['ATL', 'Atlanta Hawks', 170_000_000],
    ['CHI', 'Chicago Bulls', 158_000_000],
    ['PHI', 'Philadelphia 76ers', 200_000_000],
    ['BKN', 'Brooklyn Nets', 128_000_000],
    ['TOR', 'Toronto Raptors', 164_000_000],
    ['CHA', 'Charlotte Hornets', 140_000_000],
    ['WAS', 'Washington Wizards', 118_000_000],
    ['MIN', 'Minnesota Timberwolves', 206_000_000],
    ['HOU', 'Houston Rockets', 174_000_000],
    ['DAL', 'Dallas Mavericks', 184_000_000],
    ['MEM', 'Memphis Grizzlies', 180_000_000],
    ['PHX', 'Phoenix Suns', 216_000_000],
    ['SAC', 'Sacramento Kings', 190_000_000],
    ['LAC', 'LA Clippers', 200_000_000],
    ['POR', 'Portland Trail Blazers', 134_000_000],
    ['SAS', 'San Antonio Spurs', 162_000_000],
    ['NOP', 'New Orleans Pelicans', 174_000_000],
  ] as [string, string, number][]
).map(([id, name, target], i) => genTeam(id, name, target, 8200 + i * 137, NBA_OPTS))

// Three teams to show the apron ladder against the NBA-2026 preset:
//  • Celtics — over BOTH aprons (tax + frozen pick, but legal: no hard cap)
//  • Knicks  — over the first apron only
//  • Jazz    — below the salary floor
// Salaries kept under each player's max tier so the demo isolates apron behavior,
// not max-contract violations. Illustrative figures.
export const nbaSample = buildLeague({
  id: 'nba-sample',
  name: 'NBA — all 30 teams',
  sport: 'basketball',
  year: 2026,
  teams: [
    {
      id: 'BOS',
      name: 'Boston Celtics',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Jayson Tatum', pos: 'F', salary: 40_000_000, service: 10 },
        { name: 'Jaylen Brown', pos: 'G', salary: 36_000_000, service: 9 },
        { name: 'Kristaps Porziņģis', pos: 'C', salary: 30_000_000, service: 10 },
        { name: 'Jrue Holiday', pos: 'G', salary: 30_000_000, service: 14 },
        { name: 'Derrick White', pos: 'G', salary: 30_000_000, service: 8 },
        { name: 'Sam Hauser', pos: 'F', salary: 14_000_000, service: 6 },
        { name: 'Payton Pritchard', pos: 'G', salary: 14_000_000, service: 5 },
        { name: 'Luke Kornet', pos: 'C', salary: 8_000_000, service: 8 },
      ],
    },
    {
      id: 'NYK',
      name: 'New York Knicks',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Jalen Brunson', pos: 'G', salary: 40_000_000, service: 7 },
        { name: 'Karl-Anthony Towns', pos: 'C', salary: 49_000_000, service: 10 },
        { name: 'OG Anunoby', pos: 'F', salary: 37_000_000, service: 8 },
        { name: 'Mikal Bridges', pos: 'F', salary: 25_000_000, service: 7 },
        { name: 'Josh Hart', pos: 'G', salary: 20_000_000, service: 8 },
        { name: 'Mitchell Robinson', pos: 'C', salary: 13_000_000, service: 8 },
        { name: "Miles McBride", pos: 'G', salary: 8_000_000, service: 5 },
      ],
    },
    {
      id: 'UTA',
      name: 'Utah Jazz',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Lauri Markkanen', pos: 'F', salary: 42_000_000, service: 8 },
        { name: 'Collin Sexton', pos: 'G', salary: 18_000_000, service: 7 },
        { name: 'John Collins', pos: 'F', salary: 20_000_000, service: 8 },
        { name: 'Walker Kessler', pos: 'C', salary: 14_000_000, service: 3 },
        { name: 'Keyonte George', pos: 'G', salary: 5_000_000, service: 2 },
      ],
    },
    {
      id: 'OKC',
      name: 'Oklahoma City Thunder',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Shai Gilgeous-Alexander', pos: 'G', salary: 45_000_000, service: 7 },
        { name: 'Jalen Williams', pos: 'F', salary: 40_000_000, service: 7 },
        { name: 'Isaiah Hartenstein', pos: 'C', salary: 30_000_000, service: 8 },
        { name: 'Luguentz Dort', pos: 'G', salary: 18_000_000, service: 6 },
        { name: 'Chet Holmgren', pos: 'C', salary: 12_000_000, service: 2 },
        { name: 'Alex Caruso', pos: 'G', salary: 10_000_000, service: 8 },
      ],
    },
    {
      id: 'DEN',
      name: 'Denver Nuggets',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Nikola Jokić', pos: 'C', salary: 54_000_000, service: 10 },
        { name: 'Michael Porter Jr.', pos: 'F', salary: 38_000_000, service: 7 },
        { name: 'Jamal Murray', pos: 'G', salary: 36_000_000, service: 8 },
        { name: 'Aaron Gordon', pos: 'F', salary: 23_000_000, service: 11 },
        { name: 'Christian Braun', pos: 'G', salary: 14_000_000, service: 3 },
        { name: 'Peyton Watson', pos: 'F', salary: 10_000_000, service: 3 },
        { name: 'Julian Strawther', pos: 'G', salary: 4_000_000, service: 3 },
      ],
    },
    {
      id: 'LAL',
      name: 'Los Angeles Lakers',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'LeBron James', pos: 'F', salary: 52_000_000, service: 23 },
        { name: 'Luka Dončić', pos: 'G', salary: 46_000_000, service: 8 },
        { name: 'Austin Reaves', pos: 'G', salary: 38_000_000, service: 5 },
        { name: 'Rui Hachimura', pos: 'F', salary: 18_000_000, service: 7 },
        { name: 'Dorian Finney-Smith', pos: 'F', salary: 15_000_000, service: 10 },
        { name: 'Gabe Vincent', pos: 'G', salary: 11_000_000, service: 7 },
        { name: 'Jarred Vanderbilt', pos: 'F', salary: 11_000_000, service: 7 },
      ],
    },
    {
      id: 'GSW',
      name: 'Golden State Warriors',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Stephen Curry', pos: 'G', salary: 54_000_000, service: 16 },
        { name: 'Jimmy Butler', pos: 'F', salary: 54_000_000, service: 14 },
        { name: 'Draymond Green', pos: 'F', salary: 25_000_000, service: 13 },
        { name: 'Jonathan Kuminga', pos: 'F', salary: 23_000_000, service: 4 },
        { name: 'Moses Moody', pos: 'G', salary: 10_000_000, service: 4 },
        { name: 'Buddy Hield', pos: 'G', salary: 9_000_000, service: 9 },
        { name: 'Brandin Podziemski', pos: 'G', salary: 4_000_000, service: 2 },
      ],
    },
    {
      id: 'DET',
      name: 'Detroit Pistons',
      fillTo: 15,
      fillSalary: 1_200_000,
      stars: [
        { name: 'Cade Cunningham', pos: 'G', salary: 38_000_000, service: 4 },
        { name: 'Isaiah Stewart', pos: 'C', salary: 15_000_000, service: 6 },
        { name: 'Tobias Harris', pos: 'F', salary: 14_000_000, service: 12 },
        { name: 'Jalen Duren', pos: 'C', salary: 12_000_000, service: 3 },
        { name: 'Jaden Ivey', pos: 'G', salary: 10_000_000, service: 3 },
        { name: 'Ausar Thompson', pos: 'F', salary: 8_000_000, service: 2 },
      ],
    },
    ...generatedTeams,
  ],
})
