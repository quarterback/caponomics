import type { CapModuleDef } from '../module'
import { num } from '../params'

/** Defines where money comes from: a revenue pool and the players' share of it. */
export const revenuePool: CapModuleDef = {
  kind: 'revenuePool',
  label: 'Revenue Pool',
  category: 'revenue',
  phase: 'environment',
  blurb:
    'A pool of league revenue and the players’ share of it. Feeds a cap formula that divides the share across teams.',
  paramSchema: [
    { key: 'leagueRevenue', label: 'League revenue', type: 'money', default: 12_000_000_000, min: 0 },
    { key: 'playerSharePct', label: 'Players’ share', type: 'percent', default: 50, min: 0, max: 100 },
  ],
  defaultParams: { leagueRevenue: 12_000_000_000, playerSharePct: 50 },
  computeEnvironment(p) {
    const revenue = num(p, 'leagueRevenue')
    const share = num(p, 'playerSharePct') / 100
    return { revenue, playerShare: Math.round(revenue * share) }
  },
}
