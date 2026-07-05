import { m, preset } from './_util'

// Soft cap + luxury tax + two aprons + max tiers. The richest real system, and
// the one that shows off multi-instance modules (two aprons) and a nested pick
// penalty. Cap value simplified to a fixed number for clarity.
export const nba2026 = preset('nba-2026', 'NBA 2026', 'basketball', [
  m('revenuePool', { leagueRevenue: 11_700_000_000, playerSharePct: 51 }),
  m('capFormula', { mode: 'fixed', fixedCap: 154_600_000 }),
  // No hard cap — it's a soft-cap league.
  m('salaryFloor', { mode: 'percentOfCap', percent: 90, penalty: 'payShortfall' }),
  m('luxuryTax', {
    thresholdMode: 'fixed',
    threshold: 187_900_000,
    brackets: [
      { upTo: 5_000_000, rate: 150 },
      { upTo: 10_000_000, rate: 175 },
      { upTo: 15_000_000, rate: 250 },
      { upTo: 20_000_000, rate: 325 },
      { upTo: 0, rate: 425 },
    ],
    isRepeater: false,
    repeaterSurchargePct: 100,
  }),
  m('apron', {
    level: 1,
    thresholdMode: 'fixed',
    threshold: 195_900_000,
    restrictions: ['noSignAndTrade', 'noTaxpayerMLE', 'takeBackLimit'],
  }),
  m('apron', {
    level: 2,
    thresholdMode: 'fixed',
    threshold: 207_800_000,
    restrictions: ['frozenDraftPick', 'noAggregation', 'noBuyoutStretch'],
  }),
  m('draftPickPenalty', {
    thresholdMode: 'fixed',
    threshold: 207_800_000,
    effect: 'freeze',
    yearsOut: 7,
  }),
  m('maxContract', {
    tiers: [
      { minService: 0, pctOfCap: 25 },
      { minService: 7, pctOfCap: 30 },
      { minService: 10, pctOfCap: 35 },
    ],
  }),
  m('minimumSalary', { mode: 'flat', flat: 1_200_000 }),
  m('rosterLimits', { min: 14, max: 15 }),
])
