import { m, preset } from './_util'

// Real cap systems for the smaller leagues, so each is meaningful on load.
// Numbers are currency-agnostic — the league you test against supplies the
// currency for display.

export const wnba = preset('wnba', 'WNBA', 'basketball', [
  m('capFormula', { mode: 'fixed', fixedCap: 1_500_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('salaryFloor', { mode: 'percentOfCap', percent: 90, penalty: 'payShortfall' }),
  m('minimumSalary', { mode: 'flat', flat: 66_000 }),
  m('rosterLimits', { min: 11, max: 12 }),
])

export const cfl = preset('cfl', 'CFL', 'football', [
  m('capFormula', { mode: 'fixed', fixedCap: 5_400_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('salaryFloor', { mode: 'fixed', value: 4_750_000, penalty: 'payShortfall' }),
  m('minimumSalary', { mode: 'flat', flat: 70_000 }),
  m('rosterLimits', { min: 0, max: 45 }),
])

export const aleague = preset('aleague', 'A-League (Australia)', 'soccer', [
  m('capFormula', { mode: 'fixed', fixedCap: 2_550_000 }),
  m('allocationPool', { label: 'Marquee allowance', amount: 1_000_000 }),
  m('minimumSalary', { mode: 'flat', flat: 90_000 }),
  m('rosterLimits', { min: 20, max: 23 }),
  m('passThrough', {
    title: 'Marquee & exception rules',
    note: 'The A-League permits designated marquee players outside the cap; modeled here as an allocation allowance.',
  }),
])

export const ipl = preset('ipl', 'IPL (auction purse)', 'cricket', [
  m('capFormula', { mode: 'fixed', fixedCap: 1_200_000_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('rosterLimits', { min: 18, max: 25 }),
  m('passThrough', {
    title: 'Auction & retention',
    note: 'IPL uses an auction purse with player retention rules rather than a wage cap; modeled here as a hard spend ceiling.',
  }),
])
