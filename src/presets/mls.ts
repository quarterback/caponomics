import { m, preset } from './_util'

// A salary budget raised by allocation money (GAM/TAM), with up to 3 Designated
// Players whose full pay comes off the budget and counts only a fixed budget
// charge — the real MLS shape. Figures are illustrative — tune to your own.
export const mls = preset('mls', 'MLS', 'soccer', [
  m('capFormula', { mode: 'fixed', fixedCap: 5_950_000 }),
  m('allocationPool', { label: 'GAM + TAM', amount: 4_000_000 }),
  m('designatedPlayer', { count: 3, budgetCharge: 743_000, label: 'Designated Player' }),
  m('minimumSalary', { mode: 'flat', flat: 90_000 }),
  m('rosterLimits', { min: 18, max: 30 }),
])
