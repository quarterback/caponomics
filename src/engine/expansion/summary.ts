// Render an ExpansionModel as a rulebook: category-grouped plain-language
// lines from every enabled rule, plus roster-free "at a glance" stats. This is
// the expansion side's whole output — there is no draft resolution.

import { num, objList, str } from '../params'
import { EXPANSION_MAP } from './catalog'
import type { DescribeContext, ExpansionCategory, ExpansionModel, ModelStat, ModelSummary, RulebookSection } from './types'

export const CATEGORY_ORDER: ExpansionCategory[] = [
  'protection',
  'exemption',
  'exposure',
  'selection',
  'rounds',
  'financial',
  'special',
]

export const CATEGORY_LABEL: Record<ExpansionCategory, string> = {
  protection: 'Protection',
  exemption: 'Exemptions',
  exposure: 'Exposure',
  selection: 'Selection',
  rounds: 'Rounds & order',
  financial: 'Money',
  special: 'Special mechanics',
}

function findParams(model: ExpansionModel, kind: string): Record<string, unknown> | null {
  const inst = model.modules.find((m) => m.kind === kind && m.enabled)
  return inst ? inst.params : null
}

/** "11" for flat/slots, "11 or 9" for the choice variant. */
function protectedPerTeam(model: ExpansionModel): string | null {
  const p = findParams(model, 'protectionScheme')
  if (!p) return null
  const total = (key: string) => objList(p, key).reduce((a, r) => a + num(r, 'count', 0), 0)
  const mode = str(p, 'mode', 'flat')
  if (mode === 'flat') return String(num(p, 'flatCount', 0))
  if (mode === 'slots') return String(total('slotsA'))
  return `${total('slotsA')} or ${total('slotsB')}`
}

function statList(model: ExpansionModel, existingTeams: number | null): ModelStat[] {
  const stats: ModelStat[] = [{ label: 'New teams', value: String(model.teamsAdded) }]

  const prot = protectedPerTeam(model)
  if (prot !== null) stats.push({ label: 'Protected / team', value: prot })

  const quota = findParams(model, 'selectionQuota')
  if (quota) {
    const word = str(quota, 'perTeam', 'exactly') === 'exactly' ? '' : '≤ '
    stats.push({ label: 'Picks / existing team', value: `${word}${num(quota, 'count', 1)}` })
  }

  const rounds = findParams(model, 'rounds')
  const roundCount = rounds ? num(rounds, 'count', 1) : 1
  stats.push({ label: 'Rounds', value: String(roundCount) })

  const loss = findParams(model, 'lossLimit')
  if (loss) stats.push({ label: 'Max lost / team', value: String(num(loss, 'maxLost', 0)) })

  // Roster targets state the selection count outright; only fall back to
  // quota/loss-limit arithmetic when the model has no explicit target.
  const targets = findParams(model, 'rosterTargets')
  if (targets) {
    const min = num(targets, 'minSize', 0)
    const max = num(targets, 'maxSize', 0)
    stats.push({ label: 'Selections / new team', value: min === max ? String(min) : `${min}–${max}` })
  } else if (quota && existingTeams !== null) {
    const quotaBound = num(quota, 'count', 1) * existingTeams * roundCount
    // A loss limit caps the whole pool: existingTeams × maxLost players move
    // in total, shared across every new team.
    const lossBound = loss
      ? Math.floor((existingTeams * num(loss, 'maxLost', 0)) / Math.max(1, model.teamsAdded))
      : Infinity
    const upper = Math.min(quotaBound, lossBound)
    const exact = str(quota, 'perTeam', 'exactly') === 'exactly' && !loss
    stats.push({
      label: 'Selections / new team',
      value: `${exact ? '' : '≤ '}${upper}`,
    })
  }

  return stats
}

/** existingTeams: team count of the loaded league (null when none loaded). */
export function summarizeModel(model: ExpansionModel, existingTeams: number | null): ModelSummary {
  const ctx: DescribeContext = {
    teamsAdded: model.teamsAdded,
    existingTeams,
    currency: model.currency ?? 'USD',
  }

  const sections: RulebookSection[] = []
  for (const category of CATEGORY_ORDER) {
    const lines: string[] = []
    for (const inst of model.modules) {
      if (!inst.enabled) continue
      const def = EXPANSION_MAP[inst.kind]
      if (!def || def.category !== category) continue
      lines.push(...def.describe(inst.params, ctx))
    }
    if (lines.length) sections.push({ category, title: CATEGORY_LABEL[category], lines })
  }

  return { stats: statList(model, existingTeams), sections }
}
