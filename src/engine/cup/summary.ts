// Render a CupModel as a rulebook plus the arithmetic that needs only a team
// count: group sizes, games per team, how many advance, rounds, added games.

import { fmtMoney } from '../format'
import { bool, num, str } from '../params'
import { CUP_MAP } from './catalog'
import { entered, formatGames } from './modules'
import type { CupCategory, CupContext, CupModel, CupSection, CupStat, CupSummary } from './types'

export const CUP_CATEGORY_ORDER: CupCategory[] = ['field', 'groups', 'advance', 'knockout', 'schedule', 'prize', 'special']

export const CUP_CATEGORY_LABEL: Record<CupCategory, string> = {
  field: 'Teams',
  groups: 'Group stage',
  advance: 'Advancing',
  knockout: 'Knockout rounds',
  schedule: 'Schedule',
  prize: 'Prizes',
  special: 'Other rules',
}

const find = (model: CupModel, kind: string) => model.modules.find((m) => m.kind === kind && m.enabled)?.params ?? null

export interface CupNumbers {
  field: number
  groups: number | null
  groupGames: number | null
  advancing: number | null
  rounds: number | null
  /** Most games one team can play that do not count in the regular season. */
  addedGames: number | null
}

export function cupNumbers(model: CupModel, leagueTeams: number): CupNumbers {
  const field = entered(leagueTeams, find(model, 'cupField'))
  const gs = find(model, 'groupStage')
  const adv = find(model, 'advancement')
  const ko = find(model, 'knockout')
  const sc = find(model, 'seasonCount')

  const groups = gs ? Math.max(1, num(gs, 'groups', 6)) : null
  const size = groups ? Math.ceil(field / groups) : null
  const groupGames = gs && size ? (size - 1) * num(gs, 'meetings', 1) * num(gs, 'seriesLength', 1) : null
  const advancing = adv && groups ? Math.min(field, groups * num(adv, 'perGroup', 1) + num(adv, 'wildCards', 0)) : ko ? field : null
  const rounds = ko && advancing && advancing > 1 ? Math.ceil(Math.log2(advancing)) : null

  let addedGames: number | null = null
  if (rounds !== null && ko) {
    const early = Math.max(0, rounds - 2) * formatGames(str(ko, 'earlyFormat', 'single'))
    const semi = rounds >= 2 ? formatGames(str(ko, 'semiFormat', 'single')) : 0
    const fin = formatGames(str(ko, 'finalFormat', 'single'))
    const countsGroup = sc ? bool(sc, 'group', true) : false
    const countsKo = sc ? bool(sc, 'knockout', true) : false
    const countsFinal = sc ? bool(sc, 'final', false) : false
    addedGames = (countsGroup ? 0 : (groupGames ?? 0)) + (countsKo ? 0 : early + semi) + (countsFinal ? 0 : fin)
  }
  return { field, groups, groupGames, advancing, rounds, addedGames }
}

function statList(model: CupModel, leagueTeams: number, ctx: CupContext): CupStat[] {
  const n = cupNumbers(model, leagueTeams)
  const stats: CupStat[] = [{ label: 'Teams in the cup', value: String(n.field) }]
  if (n.groups !== null) {
    const lo = Math.floor(n.field / n.groups)
    stats.push({ label: 'Groups', value: `${n.groups} of ${n.field % n.groups === 0 ? lo : `${lo} or ${lo + 1}`}` })
  }
  if (n.groupGames !== null) stats.push({ label: 'Group games for each team', value: String(n.groupGames) })
  if (n.advancing !== null)
    stats.push({ label: 'Teams that advance', value: `${n.advancing} (${Math.round((n.advancing / n.field) * 100)}%)` })
  if (n.rounds !== null) stats.push({ label: 'Knockout rounds', value: String(n.rounds) })
  if (n.addedGames !== null) stats.push({ label: 'Most games added to one team’s season', value: String(n.addedGames) })
  const prize = find(model, 'prizeMoney')
  if (prize && num(prize, 'champion', 0) > 0)
    stats.push({ label: 'Prize for each player on the champion', value: fmtMoney(num(prize, 'champion', 0), ctx.currency) })
  return stats
}

export function summarizeCup(model: CupModel, leagueTeams: number): CupSummary {
  const ctx: CupContext = { teams: entered(leagueTeams, find(model, 'cupField')), currency: model.currency ?? 'USD' }
  const fieldCtx: CupContext = { ...ctx, teams: leagueTeams }
  const sections: CupSection[] = []
  for (const category of CUP_CATEGORY_ORDER) {
    const lines: string[] = []
    for (const inst of model.modules) {
      if (!inst.enabled) continue
      const def = CUP_MAP[inst.kind]
      if (!def || def.category !== category) continue
      lines.push(...def.describe(inst.params, category === 'field' ? fieldCtx : ctx))
    }
    if (lines.length) sections.push({ category, title: CUP_CATEGORY_LABEL[category], lines })
  }
  return { stats: statList(model, leagueTeams, ctx), sections }
}
