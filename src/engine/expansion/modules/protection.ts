import { num, objList, str, bool } from '../../params'
import type { ExpansionModuleDef } from '../types'

type Slot = { pos: string; count: number }

function slotList(p: Record<string, unknown>, key: string): Slot[] {
  return objList(p, key).map((r) => ({ pos: str(r, 'pos', '?'), count: num(r, 'count', 0) }))
}

function slotText(slots: Slot[]): string {
  return slots.map((s) => `${s.count} ${s.pos}`).join(' / ')
}

export function slotTotal(slots: Slot[]): number {
  return slots.reduce((a, s) => a + s.count, 0)
}

/** How many players each existing team shields from the draft. The core knob:
 *  flat count (NBA 8, WNBA 6→5, MLS 12, NFL 42), positional slots, or the NHL
 *  "choose scheme A or B" variant. */
export const protectionScheme: ExpansionModuleDef = {
  kind: 'protectionScheme',
  label: 'Protection Scheme',
  category: 'protection',
  blurb: 'How many players each existing team protects — flat count, positional slots, or a choice of schemes.',
  paramSchema: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'enum',
      options: [
        { value: 'flat', label: 'Flat count' },
        { value: 'slots', label: 'Positional slots' },
        { value: 'choice', label: 'Choice of A or B' },
      ],
      default: 'flat',
    },
    { key: 'flatCount', label: 'Players protected (flat)', type: 'number', default: 6, min: 0 },
    {
      key: 'slotsA',
      label: 'Scheme A slots',
      type: 'bracketList',
      itemSchema: [
        { key: 'pos', label: 'Position', type: 'text', default: 'F' },
        { key: 'count', label: 'Count', type: 'number', default: 1, min: 0 },
      ],
      default: [
        { pos: 'F', count: 7 },
        { pos: 'D', count: 3 },
        { pos: 'G', count: 1 },
      ],
      help: 'Used in slots and choice modes.',
    },
    {
      key: 'slotsB',
      label: 'Scheme B slots',
      type: 'bracketList',
      itemSchema: [
        { key: 'pos', label: 'Position', type: 'text', default: 'Skater' },
        { key: 'count', label: 'Count', type: 'number', default: 1, min: 0 },
      ],
      default: [
        { pos: 'Skater', count: 8 },
        { pos: 'G', count: 1 },
      ],
      help: 'Only used in choice mode.',
    },
  ],
  defaultParams: {
    mode: 'flat',
    flatCount: 6,
    slotsA: [
      { pos: 'F', count: 7 },
      { pos: 'D', count: 3 },
      { pos: 'G', count: 1 },
    ],
    slotsB: [
      { pos: 'Skater', count: 8 },
      { pos: 'G', count: 1 },
    ],
  },
  describe(p) {
    const mode = str(p, 'mode', 'flat')
    if (mode === 'flat') {
      return [`Each existing team protects up to ${num(p, 'flatCount', 6)} players — no positional slots.`]
    }
    const a = slotList(p, 'slotsA')
    if (mode === 'slots') {
      return [`Each existing team protects by position: ${slotText(a)} (${slotTotal(a)} players).`]
    }
    const b = slotList(p, 'slotsB')
    return [
      `Each existing team chooses its protection scheme: (A) ${slotText(a)} — ${slotTotal(a)} players, or (B) ${slotText(b)} — ${slotTotal(b)} players.`,
    ]
  },
}

/** No-movement clauses force protection (NHL: NMC players consume a slot
 *  unless the player agrees to waive). */
export const mustProtect: ExpansionModuleDef = {
  kind: 'mustProtect',
  label: 'Must-Protect Clauses',
  category: 'protection',
  blurb: 'Players with a movement clause must be protected, consuming a slot.',
  paramSchema: [
    { key: 'clause', label: 'Clause', type: 'text', default: 'no-movement clause' },
    { key: 'consumesSlot', label: 'Consumes a protection slot', type: 'boolean', default: true },
    { key: 'waivable', label: 'Player may waive it', type: 'boolean', default: true },
  ],
  defaultParams: { clause: 'no-movement clause', consumesSlot: true, waivable: true },
  describe(p) {
    const lines = [
      `Players with a ${str(p, 'clause', 'no-movement clause')} must be protected` +
        (bool(p, 'consumesSlot', true) ? ' and consume a protection slot.' : ' but do not consume a slot.'),
    ]
    if (bool(p, 'waivable', true)) lines.push('A player may waive the clause to become exposable.')
    return lines
  },
}
