import type { CapModuleDef } from '../module'
import { num } from '../params'

/** MLS/NWSL-style spendable pool (allocation money) that raises a team's
 *  effective cap. Runs after capFormula in the environment phase, adding to the
 *  cap value. */
export const allocationPool: CapModuleDef = {
  kind: 'allocationPool',
  label: 'Allocation Pool',
  category: 'cap',
  phase: 'environment',
  blurb: 'A pool of spendable money (allocation money) that raises the effective cap — the MLS/NWSL shape.',
  paramSchema: [
    { key: 'label', label: 'Label', type: 'text', default: 'Allocation Money', placeholder: 'GAM / TAM' },
    { key: 'amount', label: 'Pool amount', type: 'money', default: 2_000_000, min: 0 },
  ],
  defaultParams: { label: 'Allocation Money', amount: 2_000_000 },
  computeEnvironment(p, ctx) {
    const add = num(p, 'amount', 0)
    if (ctx.env.capValue === null) return {}
    return { capValue: ctx.env.capValue + add }
  },
}
