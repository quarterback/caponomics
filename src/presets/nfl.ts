import { m, preset } from './_util'

// A true hard cap. Proration / void-year dead money is real-life NFL cap magic,
// but in this build cap hits are input data, so we acknowledge it with a note.
export const nfl = preset('nfl', 'NFL', 'football', [
  m('capFormula', { mode: 'fixed', fixedCap: 255_400_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('salaryFloor', { mode: 'percentOfCap', percent: 89, penalty: 'payShortfall' }),
  m('minimumSalary', { mode: 'flat', flat: 795_000 }),
  m('rosterLimits', { min: 0, max: 53 }),
  m('passThrough', {
    title: 'Signing-bonus proration & void years',
    note: 'Cap hits here are already-prorated input data; dead-money derivation arrives with the transaction sandbox.',
  }),
])
