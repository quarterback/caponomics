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
    description: 'Applies the NHL’s hard cap of about $92M to NBA payrolls. Almost every team is over it.',
    rosterId: 'nba-sample',
    build: () => {
      const r = structuredClone(PRESET_MAP['nhl']!)
      r.name = 'NHL cap on NBA rosters'
      r.meta = { forkedFrom: 'NHL' }
      return r
    },
  },
  {
    id: 'mlb-second-apron',
    label: 'MLB with an NBA-style second apron',
    description: 'Adds the NBA’s second apron to the MLB proposal. Teams over that line face draft-pick and trade restrictions.',
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
