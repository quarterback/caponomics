import type { Ruleset } from '../engine/types'
import { mlb2026 } from './mlb2026'
import { nba2026 } from './nba2026'
import { nfl } from './nfl'
import { nhl } from './nhl'
import { mls } from './mls'
import { nwsl } from './nwsl'
import { pwhl } from './pwhl'
import { wnba, cfl, aleague, ipl } from './more-leagues'
import { blank } from './blank'

/** Order shown in the preset rail — hero first. */
export const PRESETS: Ruleset[] = [
  mlb2026, nba2026, nfl, nhl, mls, nwsl, pwhl, wnba, cfl, aleague, ipl, blank,
]

export const PRESET_MAP: Record<string, Ruleset> = Object.fromEntries(
  PRESETS.map((p) => [p.id, p]),
)

export const DEFAULT_PRESET_ID = 'mlb-2026'
