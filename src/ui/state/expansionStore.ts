import { create } from 'zustand'
import { EXPANSION_MAP, makeExpansionInstance } from '../../engine/expansion/catalog'
import { deserializeModel } from '../../engine/expansion/serialize'
import type { ExpansionModel } from '../../engine/expansion/types'
import { DEFAULT_EXPANSION_PRESET_ID, EXPANSION_PRESET_MAP } from '../../presets/expansion'

export type AppTab = 'cap' | 'expansion'

interface ExpansionState {
  /** Which product surface is showing. Lives here so Toolbar + AppShell share it. */
  tab: AppTab
  model: ExpansionModel
  forked: boolean
  /** Preset id shown side-by-side with the working model (null = off). */
  compareId: string | null

  setTab: (tab: AppTab) => void
  setCompareId: (id: string | null) => void
  loadPreset: (id: string) => void
  loadModelObject: (m: ExpansionModel, forked?: boolean) => void

  addRule: (kind: string) => void
  removeRule: (instanceId: string) => void
  toggleRule: (instanceId: string) => void
  moveRule: (instanceId: string, dir: -1 | 1) => void
  updateParam: (instanceId: string, key: string, value: unknown) => void
  renameModel: (name: string) => void
  setTeamsAdded: (n: number) => void
}

function cloneModel(m: ExpansionModel): ExpansionModel {
  return structuredClone(m)
}

const initialModel = cloneModel(EXPANSION_PRESET_MAP[DEFAULT_EXPANSION_PRESET_ID]!)

export const useExpansion = create<ExpansionState>((set, get) => {
  /** Apply a mutation to the model and mark it forked. */
  const mutate = (fn: (m: ExpansionModel) => void, opts: { fork?: boolean } = {}) => {
    const m = cloneModel(get().model)
    fn(m)
    set({ model: m, forked: opts.fork === false ? get().forked : true })
  }

  return {
    tab: 'cap',
    model: initialModel,
    forked: false,
    compareId: null,

    setTab: (tab) => set({ tab }),

    setCompareId: (id) => set({ compareId: id && EXPANSION_PRESET_MAP[id] ? id : null }),

    loadPreset: (id) => {
      const preset = EXPANSION_PRESET_MAP[id]
      if (!preset) return
      set({ model: cloneModel(preset), forked: false })
    },

    loadModelObject: (m, forked = true) => {
      set({ model: deserializeModel(m), forked })
    },

    addRule: (kind) =>
      mutate((m) => {
        const inst = makeExpansionInstance(kind, String(m.modules.length + 1))
        if (!inst) return
        // Keep the stack readable: insert after the last rule of the same
        // category so the rulebook groups stay together while building.
        const cat = EXPANSION_MAP[kind]!.category
        const last = m.modules.map((x) => EXPANSION_MAP[x.kind]?.category).lastIndexOf(cat)
        if (last >= 0) m.modules.splice(last + 1, 0, inst)
        else m.modules.push(inst)
      }),

    removeRule: (instanceId) => mutate((m) => { m.modules = m.modules.filter((x) => x.id !== instanceId) }),

    toggleRule: (instanceId) =>
      mutate((m) => {
        const x = m.modules.find((x) => x.id === instanceId)
        if (x) x.enabled = !x.enabled
      }),

    moveRule: (instanceId, dir) =>
      mutate((m) => {
        const i = m.modules.findIndex((x) => x.id === instanceId)
        const j = i + dir
        if (i < 0 || j < 0 || j >= m.modules.length) return
        const tmp = m.modules[i]!
        m.modules[i] = m.modules[j]!
        m.modules[j] = tmp
      }),

    updateParam: (instanceId, key, value) =>
      mutate((m) => {
        const x = m.modules.find((x) => x.id === instanceId)
        if (x) x.params = { ...x.params, [key]: value }
      }),

    renameModel: (name) => mutate((m) => { m.name = name }, { fork: false }),

    setTeamsAdded: (n) => mutate((m) => { m.teamsAdded = Math.max(1, Math.round(n)) }),
  }
})
