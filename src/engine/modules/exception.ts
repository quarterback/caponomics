import type { CapModuleDef } from '../module'
import { num, str } from '../params'

/** A workaround, the "raise the ceiling" transform: grants each team an over-cap
 *  allowance that a hard cap will permit — the Bird-rights / mid-level-exception
 *  move ("you may exceed the cap by X to keep/add a player"). Modeled league-wide
 *  as extra room every team may use; a hard cap adds it to its ceiling.
 *  (In a pure soft-cap system there's no hard line, so this has no effect — which
 *  is correct: soft caps already let you exceed.) */
export const exception: CapModuleDef = {
  kind: 'exception',
  label: 'Over-Cap Exception',
  category: 'exception',
  phase: 'environment',
  blurb: 'Lets each team exceed a hard cap by a set amount. The NBA’s Bird rights and mid-level exception work this way.',
  paramSchema: [
    { key: 'label', label: 'Label', type: 'text', default: 'Exception', placeholder: 'e.g. Bird rights' },
    {
      key: 'mode',
      label: 'Set the allowance as',
      type: 'enum',
      options: [
        { value: 'fixed', label: 'Fixed amount' },
        { value: 'percentOfCap', label: 'Percent of cap' },
      ],
      default: 'fixed',
    },
    { key: 'amount', label: 'Over-cap allowance', type: 'money', default: 12_800_000, min: 0 },
    { key: 'percent', label: 'Percent of cap', type: 'percent', default: 8, min: 0, max: 100 },
  ],
  defaultParams: { label: 'Exception', mode: 'fixed', amount: 12_800_000, percent: 8 },
  computeEnvironment(p, ctx) {
    const cap = ctx.env.capValue
    const room =
      str(p, 'mode', 'fixed') === 'percentOfCap'
        ? cap === null
          ? 0
          : Math.round((cap * num(p, 'percent', 8)) / 100)
        : num(p, 'amount')
    const prev = (ctx.env.scratch['overCapRoom'] as number) ?? 0
    return { scratch: { overCapRoom: prev + room } }
  },
}
