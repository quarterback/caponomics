import type { CapModuleDef } from '../module'
import { num, str } from '../params'

/** Turns revenue into the season's cap number, or just sets a fixed cap.
 *  `fixed`        → capValue = fixedCap
 *  `shareDivided` → capValue = players' share / number of teams (needs revenuePool) */
export const capFormula: CapModuleDef = {
  kind: 'capFormula',
  label: 'Cap Formula',
  category: 'cap',
  phase: 'environment',
  blurb: 'Sets the season’s cap number — a fixed value, or the players’ revenue share divided across teams.',
  paramSchema: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'enum',
      options: [
        { value: 'fixed', label: 'Fixed cap' },
        { value: 'shareDivided', label: 'Revenue share ÷ teams' },
      ],
      default: 'fixed',
    },
    { key: 'fixedCap', label: 'Fixed cap', type: 'money', default: 200_000_000, min: 0 },
    { key: 'teams', label: 'Number of teams', type: 'number', default: 30, min: 1 },
  ],
  defaultParams: { mode: 'fixed', fixedCap: 200_000_000, teams: 30 },
  computeEnvironment(p, ctx) {
    const mode = str(p, 'mode', 'fixed')
    if (mode === 'shareDivided') {
      const share = ctx.env.playerShare
      const teams = Math.max(1, num(p, 'teams', 30))
      if (share !== null) return { capValue: Math.round(share / teams) }
    }
    return { capValue: num(p, 'fixedCap') }
  },
}
