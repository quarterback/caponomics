// Built-in base charges + cap-sheet aggregation.
import type { CapCharge, Team, LeagueYear, TeamYearTotals } from './types'

/** Turn each contract's salary for `year` into a base CapCharge. Runs before any
 *  module, so even a blank ruleset produces a cap sheet. */
export function baseSalaryCharges(team: Team, year: LeagueYear): CapCharge[] {
  const charges: CapCharge[] = []
  for (const c of team.roster) {
    const amount = c.salaryByYear[year]
    if (amount === undefined) continue
    charges.push({
      year,
      amount,
      type: 'base',
      playerId: c.playerId,
      contractId: c.id,
      sourceModule: '',
      countsTowardCap: true,
    })
  }
  return charges
}

/** Recompute totals from the current cap sheet. Called after each charge module
 *  and once more before the validate phase. */
export function computeTotals(
  charges: CapCharge[],
  team: Team,
  year: LeagueYear,
): TeamYearTotals {
  let capSalary = 0
  let deadMoney = 0
  for (const ch of charges) {
    if (ch.countsTowardCap) capSalary += ch.amount
    if (ch.type === 'deadMoney') deadMoney += ch.amount
  }
  const cashFromField = team.cashSpendByYear?.[year]
  const cashSpend = cashFromField ?? capSalary
  // Distinct players on the sheet this year.
  const playerCount = new Set(
    team.roster.filter((c) => c.salaryByYear[year] !== undefined).map((c) => c.playerId),
  ).size
  return { capSalary, cashSpend, deadMoney, playerCount }
}
