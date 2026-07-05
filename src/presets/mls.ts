import { m, preset } from './_util'

// A salary budget raised by allocation money (GAM/TAM), with Designated Players
// carved out of the budget via a retained-rights-style exemption. The
// allocation-money shape. Figures are illustrative — tune to your own.
export const mls = preset('mls', 'MLS', 'soccer', [
  m('capFormula', { mode: 'fixed', fixedCap: 5_950_000 }),
  m('allocationPool', { label: 'GAM + TAM', amount: 4_000_000 }),
  m('maxContract', { tiers: [{ minService: 0, pctOfCap: 10 }] }),
  m('retainedRights', { label: 'Designated Player', effect: 'exemptFromMax', designatedPlayerIds: [] }),
  m('minimumSalary', { mode: 'flat', flat: 90_000 }),
  m('rosterLimits', { min: 18, max: 30 }),
])
