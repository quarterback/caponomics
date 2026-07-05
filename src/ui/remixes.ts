import { makeInstance, MODULE_MAP } from '../engine/catalog'
import { PRESET_MAP } from '../presets'
import type { Ruleset } from '../engine/types'

export interface Remix {
  id: string
  label: string
  description: string
  rosterId: string
  build: () => Ruleset
}

/** The headline "wow": run any roster against any invented system, including
 *  systems grafted across leagues. */
export const REMIXES: Remix[] = [
  {
    id: 'nba-under-nhl',
    label: 'NBA rosters under the NHL hard cap',
    description: 'Take NBA payrolls and drop them under hockey’s ~$92M ceiling. Almost everyone breaks.',
    rosterId: 'nba-sample',
    build: () => {
      const r = structuredClone(PRESET_MAP['nhl']!)
      r.name = 'NHL cap → NBA rosters'
      r.meta = { forkedFrom: 'NHL' }
      return r
    },
  },
  {
    id: 'mlb-second-apron',
    label: 'MLB with an NBA-style second apron',
    description: 'Graft basketball’s second apron (frozen picks, no aggregation) onto the baseball proposal.',
    rosterId: 'mlb-sample',
    build: () => {
      const r = structuredClone(PRESET_MAP['mlb-2026']!)
      r.name = 'MLB + second apron'
      r.meta = { forkedFrom: 'MLB 2026 Proposal' }
      const apron = makeInstance('apron', 'remix')
      if (apron && MODULE_MAP['apron']) {
        apron.params = {
          ...apron.params,
          level: 2,
          thresholdMode: 'fixed',
          threshold: 270_000_000,
          restrictions: ['frozenDraftPick', 'noAggregation', 'noBuyoutStretch'],
        }
        // Slot it just before roster limits for readability.
        r.modules.push(apron)
      }
      return r
    },
  },
]
