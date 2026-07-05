import { m, preset } from './_util'

// Soft cap with allocation money, smaller numbers. Illustrative figures.
export const nwsl = preset('nwsl', 'NWSL', 'soccer', [
  m('capFormula', { mode: 'fixed', fixedCap: 3_300_000 }),
  m('allocationPool', { label: 'Allocation Money', amount: 500_000 }),
  m('minimumSalary', { mode: 'flat', flat: 48_500 }),
  m('rosterLimits', { min: 18, max: 26 }),
])
