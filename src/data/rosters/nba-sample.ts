import { buildLeague } from './build'

// Three teams to show the apron ladder against the NBA-2026 preset:
//  • Celtics — over BOTH aprons (tax + frozen pick, but legal: no hard cap)
//  • Knicks  — over the first apron only
//  • Jazz    — below the salary floor
// Salaries kept under each player's max tier so the demo isolates apron behavior,
// not max-contract violations. Illustrative figures.
export const nbaSample = buildLeague({
  id: 'nba-sample',
  name: 'NBA Sample (3 teams)',
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
  ],
})
