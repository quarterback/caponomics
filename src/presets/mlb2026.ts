import { m, preset } from './_util'

// The hero preset — the 2026 MLB cap/floor proposal made concrete. Baseball has
// no cap today, so this is the "what if MLB had one" canvas. Numbers follow the
// proposal's shape (soft cap + hard ceiling + floor + graduated tax + a
// Cornerstone re-sign advantage). Tune freely — it's a calculator, not a rulebook.
export const mlb2026 = preset('mlb-2026', 'MLB 2026 Proposal', 'baseball', [
  m('revenuePool', { leagueRevenue: 12_000_000_000, playerSharePct: 48 }),
  m('capFormula', { mode: 'fixed', fixedCap: 240_000_000 }),
  m('hardCap', { source: 'fixed', ceiling: 300_000_000, basis: 'cap' }),
  m('salaryFloor', { mode: 'fixed', value: 100_000_000, penalty: 'payShortfall', hardFloor: true }),
  m('luxuryTax', {
    thresholdMode: 'fixed',
    threshold: 240_000_000,
    brackets: [
      { upTo: 20_000_000, rate: 20 },
      { upTo: 40_000_000, rate: 32 },
      { upTo: 0, rate: 50 },
    ],
  }),
  m('maxContract', {
    tiers: [
      { minService: 0, pctOfCap: 15 },
      { minService: 6, pctOfCap: 16 },
    ],
  }),
  m('retainedRights', { label: 'Cornerstone', effect: 'exemptFromMax', designatedPlayerIds: [] }),
  m('minimumSalary', { mode: 'flat', flat: 780_000 }),
  m('rosterLimits', { min: 24, max: 26 }),
])
