import { m, preset } from './_util'

// The "hello world" preset: a young league with a simple hard team-salary cap and
// standardized contracts. The minimal shape — proves the engine scales down to
// tiny numbers just as happily as it scales up. Illustrative figures.
export const pwhl = preset('pwhl', 'PWHL', 'hockey', [
  m('capFormula', { mode: 'fixed', fixedCap: 1_500_000 }),
  m('hardCap', { source: 'useCapValue', basis: 'cap' }),
  m('minimumSalary', { mode: 'flat', flat: 35_000 }),
  m('rosterLimits', { min: 0, max: 23 }),
])
