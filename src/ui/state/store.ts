import { create } from 'zustand'
import { evaluateRuleset } from '../../engine/evaluate'
import { makeInstance, MODULE_MAP } from '../../engine/catalog'
import { deserializeRuleset } from '../../engine/serialize'
import { PRESET_MAP, DEFAULT_PRESET_ID } from '../../presets'
import { ROSTER_MAP } from '../../data/rosters'
import type { ComplianceReport, League, Ruleset } from '../../engine/types'

/** Deep clone a ruleset so edits never mutate the shared preset object. */
function cloneRuleset(r: Ruleset): Ruleset {
  return structuredClone(r)
}

function recompute(league: League, ruleset: Ruleset): ComplianceReport {
  return evaluateRuleset(league, ruleset)
}

interface CapState {
  ruleset: Ruleset
  league: League
  rosterId: string
  selectedTeamId: string
  forked: boolean
  report: ComplianceReport

  loadPreset: (id: string) => void
  loadRulesetObject: (r: Ruleset, forked?: boolean) => void
  loadRemix: (r: Ruleset, rosterId: string) => void
  loadRoster: (id: string) => void
  selectTeam: (teamId: string) => void

  addModule: (kind: string) => void
  removeModule: (instanceId: string) => void
  toggleModule: (instanceId: string) => void
  moveModule: (instanceId: string, dir: -1 | 1) => void
  updateParam: (instanceId: string, key: string, value: unknown) => void
  renameRuleset: (name: string) => void
}

const initialPreset = cloneRuleset(PRESET_MAP[DEFAULT_PRESET_ID]!)
const initialRosterId = 'mlb-sample'
const initialLeague = ROSTER_MAP[initialRosterId]!.league

export const useStore = create<CapState>((set, get) => {
  /** Apply a mutation to the ruleset, mark it forked, and re-evaluate. */
  const mutate = (fn: (r: Ruleset) => void, opts: { fork?: boolean } = {}) => {
    const r = cloneRuleset(get().ruleset)
    fn(r)
    const league = get().league
    set({
      ruleset: r,
      report: recompute(league, r),
      forked: opts.fork === false ? get().forked : true,
    })
  }

  return {
    ruleset: initialPreset,
    league: initialLeague,
    rosterId: initialRosterId,
    selectedTeamId: initialLeague.teams[0]?.id ?? '',
    forked: false,
    report: recompute(initialLeague, initialPreset),

    loadPreset: (id) => {
      const preset = PRESET_MAP[id]
      if (!preset) return
      const r = cloneRuleset(preset)
      set({ ruleset: r, forked: false, report: recompute(get().league, r) })
    },

    loadRulesetObject: (r, forked = true) => {
      const clean = deserializeRuleset(r)
      set({ ruleset: clean, forked, report: recompute(get().league, clean) })
    },

    loadRemix: (r, rosterId) => {
      const opt = ROSTER_MAP[rosterId]
      const league = opt ? opt.league : get().league
      const clean = deserializeRuleset(r)
      set({
        ruleset: clean,
        league,
        rosterId: opt ? rosterId : get().rosterId,
        selectedTeamId: league.teams[0]?.id ?? '',
        forked: true,
        report: recompute(league, clean),
      })
    },

    loadRoster: (id) => {
      const opt = ROSTER_MAP[id]
      if (!opt) return
      const league = opt.league
      set({
        league,
        rosterId: id,
        selectedTeamId: league.teams[0]?.id ?? '',
        report: recompute(league, get().ruleset),
      })
    },

    selectTeam: (teamId) => set({ selectedTeamId: teamId }),

    addModule: (kind) =>
      mutate((r) => {
        const suffix = String(r.modules.length + 1)
        const inst = makeInstance(kind, suffix)
        if (inst) {
          // Insert into a sensible slot: environment modules up top, then the rest.
          const def = MODULE_MAP[kind]!
          if (def.phase === 'environment') {
            const lastEnv = r.modules.map((m) => MODULE_MAP[m.kind]?.phase).lastIndexOf('environment')
            r.modules.splice(lastEnv + 1, 0, inst)
          } else {
            r.modules.push(inst)
          }
        }
      }),

    removeModule: (instanceId) => mutate((r) => { r.modules = r.modules.filter((m) => m.id !== instanceId) }),

    toggleModule: (instanceId) =>
      mutate((r) => {
        const m = r.modules.find((m) => m.id === instanceId)
        if (m) m.enabled = !m.enabled
      }),

    moveModule: (instanceId, dir) =>
      mutate((r) => {
        const i = r.modules.findIndex((m) => m.id === instanceId)
        const j = i + dir
        if (i < 0 || j < 0 || j >= r.modules.length) return
        const tmp = r.modules[i]!
        r.modules[i] = r.modules[j]!
        r.modules[j] = tmp
      }),

    updateParam: (instanceId, key, value) =>
      mutate((r) => {
        const m = r.modules.find((m) => m.id === instanceId)
        if (m) m.params = { ...m.params, [key]: value }
      }),

    renameRuleset: (name) => mutate((r) => { r.name = name }, { fork: false }),
  }
})
