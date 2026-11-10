import { create } from 'zustand'
import { CUP_MAP, makeCupInstance } from '../../engine/cup/catalog'
import { deserializeCup } from '../../engine/cup/serialize'
import type { CupModel } from '../../engine/cup/types'
import { CUP_PRESET_MAP, DEFAULT_CUP_PRESET_ID } from '../../presets/cup'

interface CupState {
  model: CupModel
  forked: boolean
  /** Preset shown beside the working model (null = off). */
  compareId: string | null
  setCompareId: (id: string | null) => void
  loadPreset: (id: string) => void
  loadModelObject: (m: CupModel, forked?: boolean) => void
  addRule: (kind: string) => void
  removeRule: (instanceId: string) => void
  toggleRule: (instanceId: string) => void
  moveRule: (instanceId: string, dir: -1 | 1) => void
  updateParam: (instanceId: string, key: string, value: unknown) => void
}

export const useCup = create<CupState>((set, get) => {
  const mutate = (fn: (m: CupModel) => void) => {
    const m = structuredClone(get().model)
    fn(m)
    set({ model: m, forked: true })
  }
  return {
    model: structuredClone(CUP_PRESET_MAP[DEFAULT_CUP_PRESET_ID]!),
    forked: false,
    compareId: null,
    setCompareId: (id) => set({ compareId: id && CUP_PRESET_MAP[id] ? id : null }),
    loadPreset: (id) => {
      const preset = CUP_PRESET_MAP[id]
      if (preset) set({ model: structuredClone(preset), forked: false })
    },
    loadModelObject: (m, forked = true) => set({ model: deserializeCup(m), forked }),
    addRule: (kind) =>
      mutate((m) => {
        const inst = makeCupInstance(kind, String(m.modules.length + 1))
        if (!inst) return
        // Keep rules of one category together so the rulebook reads in order.
        const cat = CUP_MAP[kind]!.category
        const last = m.modules.map((x) => CUP_MAP[x.kind]?.category).lastIndexOf(cat)
        if (last >= 0) m.modules.splice(last + 1, 0, inst)
        else m.modules.push(inst)
      }),
    removeRule: (id) => mutate((m) => void (m.modules = m.modules.filter((x) => x.id !== id))),
    toggleRule: (id) =>
      mutate((m) => {
        const x = m.modules.find((x) => x.id === id)
        if (x) x.enabled = !x.enabled
      }),
    moveRule: (id, dir) =>
      mutate((m) => {
        const i = m.modules.findIndex((x) => x.id === id)
        const j = i + dir
        if (i < 0 || j < 0 || j >= m.modules.length) return
        const tmp = m.modules[i]!
        m.modules[i] = m.modules[j]!
        m.modules[j] = tmp
      }),
    updateParam: (id, key, value) =>
      mutate((m) => {
        const x = m.modules.find((x) => x.id === id)
        if (x) x.params = { ...x.params, [key]: value }
      }),
  }
})
