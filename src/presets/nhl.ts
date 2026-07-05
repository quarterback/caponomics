import { m, preset } from './_util'

// Hard upper limit + hard lower limit (floor), plus a single-tier individual max.
export const nhl = preset('nhl', 'NHL', 'hockey', [
  m('capFormula', { mode: 'fixed', fixedCap: 92_400_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('salaryFloor', { mode: 'fixed', value: 68_000_000, penalty: 'payShortfall', hardFloor: true }),
  m('maxContract', { tiers: [{ minService: 0, pctOfCap: 20 }] }),
  m('minimumSalary', { mode: 'flat', flat: 775_000 }),
  m('rosterLimits', { min: 0, max: 23 }),
  m('passThrough', {
    title: 'LTIR & performance bonuses',
    note: 'Long-term injury relief and bonus overage are not modeled in this build.',
  }),
])
