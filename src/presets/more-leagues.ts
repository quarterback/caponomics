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
], 'CAD')

export const aleague = preset('aleague', 'A-League (Australia)', 'soccer', [
  m('capFormula', { mode: 'fixed', fixedCap: 2_550_000 }),
  m('allocationPool', { label: 'Marquee allowance', amount: 1_000_000 }),
  m('minimumSalary', { mode: 'flat', flat: 90_000 }),
  m('rosterLimits', { min: 20, max: 23 }),
  m('passThrough', {
    title: 'Marquee & exception rules',
    note: 'The A-League permits designated marquee players outside the cap; modeled here as an allocation allowance.',
  }),
], 'AUD')

export const ipl = preset('ipl', 'IPL (auction purse)', 'cricket', [
  m('capFormula', { mode: 'fixed', fixedCap: 1_200_000_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('rosterLimits', { min: 18, max: 25 }),
  m('passThrough', {
    title: 'Auction & retention',
    note: 'IPL uses an auction purse with player retention rules rather than a wage cap; modeled here as a hard spend ceiling.',
  }),
], 'INR')

// KBO (Korea) — a soft cap on the top-40 salaries (~₩11.4B) with escalating
// penalties: 50% of the overage the first year, then 100%/150% + a 9-spot
// first-round draft drop on repeat years. Single-year here: 50% tax + the draft
// drop, with a note on the escalation.
export const kbo = preset('kbo', 'KBO (soft cap)', 'baseball', [
  m('capFormula', { mode: 'fixed', fixedCap: 11_400_000_000 }),
  m('luxuryTax', {
    thresholdMode: 'fixed',
    threshold: 11_400_000_000,
    brackets: [{ upTo: 0, rate: 50 }],
  }),
  m('draftPickPenalty', {
    thresholdMode: 'fixed',
    threshold: 11_400_000_000,
    effect: 'dropSpots',
    dropSpots: 9,
  }),
  m('minimumSalary', { mode: 'flat', flat: 30_000_000 }),
  m('rosterLimits', { min: 0, max: 28 }),
  m('passThrough', {
    title: 'Escalating penalties',
    note: 'Repeat overages escalate to 100%/150% of the excess plus the draft drop; only the first-year 50% is modeled here.',
  }),
], 'KRW')

// NPB (Japan) — no salary cap at all. Its real constraint is the foreign-player
// limit (max 4 active), a roster-composition rule not yet modeled.
export const npb = preset('npb', 'NPB (no cap)', 'baseball', [
  m('minimumSalary', { mode: 'flat', flat: 4_400_000 }),
  m('rosterLimits', { min: 0, max: 29 }),
  m('passThrough', {
    title: 'No cap · foreign-player limit',
    note: 'NPB has no salary cap or tax. Its main roster rule is a max of 4 foreign players active (not all pitchers or all fielders) — a composition limit not yet modeled.',
  }),
], 'JPY')
