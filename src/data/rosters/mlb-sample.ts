import { buildLeague } from './build'

// Four teams tuned to exercise the MLB-2026 preset against a real spread:
//  • Dodgers  — over the $300M hard cap + top tax tier; Ohtani above the 16% max
//  • Yankees  — in the tax, but legal (under the hard cap, no max violation)
//  • Rays     — below the $100M floor
//  • Athletics— below the floor and right at the roster minimum
// Illustrative salaries (not official). It's a calculator, not a prescription.
export const mlbSample = buildLeague({
  id: 'mlb-sample',
  name: 'MLB Sample (4 teams)',
  sport: 'baseball',
  year: 2026,
  teams: [
    {
      id: 'LAD',
      name: 'Los Angeles Dodgers',
      fillTo: 26,
      stars: [
        { name: 'Shohei Ohtani', pos: 'DH', salary: 70_000_000, service: 7 },
        { name: 'Mookie Betts', pos: 'SS', salary: 32_000_000, service: 11 },
        { name: 'Freddie Freeman', pos: '1B', salary: 27_000_000, service: 14 },
        { name: 'Yoshinobu Yamamoto', pos: 'SP', salary: 27_000_000, service: 2 },
        { name: 'Blake Snell', pos: 'SP', salary: 27_000_000, service: 9 },
        { name: 'Tyler Glasnow', pos: 'SP', salary: 27_000_000, service: 8 },
        { name: 'Teoscar Hernández', pos: 'OF', salary: 18_000_000, service: 8 },
        { name: 'Will Smith', pos: 'C', salary: 16_000_000, service: 6 },
        { name: 'Max Muncy', pos: '3B', salary: 13_000_000, service: 11 },
        { name: 'Tommy Edman', pos: '2B', salary: 12_000_000, service: 6 },
        { name: 'Michael Conforto', pos: 'OF', salary: 10_000_000, service: 9 },
        { name: 'Blake Treinen', pos: 'RP', salary: 8_000_000, service: 12 },
        { name: 'Clayton Kershaw', pos: 'SP', salary: 5_000_000, service: 17 },
        { name: 'Miguel Rojas', pos: 'IF', salary: 5_000_000, service: 11 },
      ],
    },
    {
      id: 'NYY',
      name: 'New York Yankees',
      fillTo: 26,
      stars: [
        { name: 'Aaron Judge', pos: 'OF', salary: 38_000_000, service: 8 },
        { name: 'Max Fried', pos: 'SP', salary: 28_000_000, service: 7 },
        { name: 'Gerrit Cole', pos: 'SP', salary: 36_000_000, service: 12 },
        { name: 'Carlos Rodón', pos: 'SP', salary: 28_000_000, service: 9 },
        { name: 'Giancarlo Stanton', pos: 'DH', salary: 25_000_000, service: 15 },
        { name: 'Cody Bellinger', pos: 'OF', salary: 26_000_000, service: 8 },
        { name: 'Marcus Stroman', pos: 'SP', salary: 18_000_000, service: 10 },
        { name: 'Jazz Chisholm Jr.', pos: '2B', salary: 12_000_000, service: 5 },
        { name: 'Paul Goldschmidt', pos: '1B', salary: 12_000_000, service: 14 },
        { name: 'Devin Williams', pos: 'RP', salary: 9_000_000, service: 7 },
        { name: 'Anthony Volpe', pos: 'SS', salary: 3_000_000, service: 3 },
      ],
    },
    {
      id: 'TB',
      name: 'Tampa Bay Rays',
      fillTo: 26,
      fillSalary: 900_000,
      stars: [
        { name: 'Yandy Díaz', pos: '1B', salary: 12_000_000, service: 8 },
        { name: 'Brandon Lowe', pos: '2B', salary: 10_000_000, service: 7 },
        { name: 'Pete Fairbanks', pos: 'RP', salary: 7_000_000, service: 6 },
        { name: 'Zach Eflin', pos: 'SP', salary: 8_000_000, service: 9 },
        { name: 'Drew Rasmussen', pos: 'SP', salary: 5_000_000, service: 5 },
        { name: 'Ryan Pepiot', pos: 'SP', salary: 4_000_000, service: 3 },
        { name: 'Junior Caminero', pos: '3B', salary: 3_000_000, service: 2 },
        { name: 'Josh Lowe', pos: 'OF', salary: 4_000_000, service: 4 },
        { name: 'Taj Bradley', pos: 'SP', salary: 3_000_000, service: 3 },
      ],
    },
    {
      id: 'ATH',
      name: 'Athletics',
      fillTo: 24,
      fillSalary: 900_000,
      stars: [
        { name: 'Brent Rooker', pos: 'DH', salary: 12_000_000, service: 5 },
        { name: 'Luis Severino', pos: 'SP', salary: 22_000_000, service: 9 },
        { name: 'Nick Kurtz', pos: '1B', salary: 3_000_000, service: 1 },
        { name: 'Lawrence Butler', pos: 'OF', salary: 4_000_000, service: 2 },
        { name: 'Mason Miller', pos: 'RP', salary: 3_000_000, service: 2 },
        { name: 'JP Sears', pos: 'SP', salary: 3_000_000, service: 4 },
      ],
    },
  ],
})
