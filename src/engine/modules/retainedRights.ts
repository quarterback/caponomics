import type { CapModuleDef } from '../module'
import { str, strList } from '../params'

/** Re-sign-your-own advantage (generalizes Bird rights / MLB "Cornerstone").
 *  Declarative in MVP: it marks designated players as exempt from the max
 *  contract. (Full re-signing exception logic is a transaction-time concern,
 *  deferred to the sandbox.) Runs in the charge phase so maxContract's validate
 *  sees the exemption via shared ctx.scratch. */
export const retainedRights: CapModuleDef = {
  kind: 'retainedRights',
  label: 'Retained Rights',
  category: 'contract',
  phase: 'charge',
  blurb: 'Lets a team pay its designated players more than the max contract. It is modeled on NBA Bird rights.',
  paramSchema: [
    { key: 'label', label: 'Label', type: 'text', default: 'Cornerstone', placeholder: 'e.g. Cornerstone' },
    // Options are injected by the UI from the loaded roster (see ParamForm).
    { key: 'designatedPlayerIds', label: 'Designated players', type: 'enumMulti', options: [], default: [] },
    {
      key: 'effect',
      label: 'Effect',
      type: 'enum',
      options: [{ value: 'exemptFromMax', label: 'Exempt from max contract' }],
      default: 'exemptFromMax',
    },
  ],
  defaultParams: { label: 'Cornerstone', designatedPlayerIds: [], effect: 'exemptFromMax' },
  contributes(p, ctx) {
    if (str(p, 'effect', 'exemptFromMax') === 'exemptFromMax') {
      const set = (ctx.scratch['exemptFromMax'] as Set<string>) ?? new Set<string>()
      for (const id of strList(p, 'designatedPlayerIds')) set.add(id)
      ctx.scratch['exemptFromMax'] = set
    }
    return []
  },
}
