import { result, type CapModuleDef } from '../module'
import { str } from '../params'

/** Documents a mechanic the engine doesn't model yet (NFL proration, NHL LTIR…)
 *  so a preset can acknowledge it without faking enforcement. Always legal. */
export const passThrough: CapModuleDef = {
  kind: 'passThrough',
  label: 'Note on a Rule Not Modeled',
  category: 'misc',
  phase: 'validate',
  blurb: 'A note about a rule this app does not model yet. The note never changes whether a team is legal.',
  paramSchema: [
    { key: 'title', label: 'Title', type: 'text', default: 'Rule not modeled', placeholder: 'e.g. Signing-bonus proration' },
    { key: 'note', label: 'Note', type: 'text', default: '', placeholder: 'Describe the rule this note covers' },
  ],
  defaultParams: { title: 'Rule not modeled', note: '' },
  validate(p) {
    const title = str(p, 'title', 'Rule not modeled')
    const note = str(p, 'note', '')
    return result({ reasons: [{ severity: 'info', module: 'passThrough', message: note ? `${title}: ${note}` : title }] })
  },
}
