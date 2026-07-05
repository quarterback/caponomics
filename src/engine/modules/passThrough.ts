import { result, type CapModuleDef } from '../module'
import { str } from '../params'

/** Documents a mechanic the engine doesn't model yet (NFL proration, NHL LTIR…)
 *  so a preset can acknowledge it without faking enforcement. Always legal. */
export const passThrough: CapModuleDef = {
  kind: 'passThrough',
  label: 'Note / Unmodeled Mechanic',
  category: 'misc',
  phase: 'validate',
  blurb: 'A documented placeholder for a mechanic not yet modeled. Never affects legality.',
  paramSchema: [
    { key: 'title', label: 'Title', type: 'text', default: 'Unmodeled mechanic', placeholder: 'e.g. Signing-bonus proration' },
    { key: 'note', label: 'Note', type: 'text', default: '', placeholder: 'What this stands in for' },
  ],
  defaultParams: { title: 'Unmodeled mechanic', note: '' },
  validate(p) {
    const title = str(p, 'title', 'Unmodeled mechanic')
    const note = str(p, 'note', '')
    return result({ reasons: [{ severity: 'info', module: 'passThrough', message: note ? `${title} — ${note}` : title }] })
  },
}
