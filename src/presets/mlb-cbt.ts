import { m, preset } from './_util'

// The ACTUAL current MLB system (as opposed to the 2026 cap/floor proposal): no
// cap, no floor — a Competitive Balance Tax on payroll above a threshold, with
// escalating surcharge tiers and a top "Cohen tax" tier that also moves the
// team's top draft pick back 10 spots. Rates shown are first-time-payor;
// consecutive-year payors escalate.
export const mlbCbt = preset('mlb-cbt', 'MLB Luxury Tax (current CBT)', 'baseball', [
  m('luxuryTax', {
    thresholdMode: 'fixed',
    threshold: 244_000_000,
    brackets: [
      { upTo: 20_000_000, rate: 20 }, // base → +$20M
      { upTo: 40_000_000, rate: 32 }, // +$20M → +$40M (20% + 12% surcharge)
      { upTo: 60_000_000, rate: 62.5 }, // +$40M → +$60M (20% + 42.5%)
      { upTo: 0, rate: 80 }, // +$60M and up — the "Cohen tax" (20% + 60%)
    ],
  }),
  m('draftPickPenalty', {
    thresholdMode: 'fixed',
    threshold: 304_000_000, // $60M over the $244M line
    effect: 'dropSpots',
    dropSpots: 10,
  }),
  m('minimumSalary', { mode: 'flat', flat: 780_000 }),
  m('rosterLimits', { min: 24, max: 26 }),
  m('passThrough', {
    title: 'Repeater rates',
    note: 'Rates shown are for a first-time payor; second-consecutive years run ~30/42/75/90% and third-plus ~50/62/95/110%.',
  }),
])
