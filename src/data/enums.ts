// Shared enums referenced by modules as DATA (so inventing a variant = picking
// different values, not writing code).

/** Restrictions an apron (or spending line) can impose. In MVP these are
 *  informational — they constrain *transactions*, which don't exist yet — so the
 *  apron module surfaces them as warnings/readouts, not hard illegality. */
export const APRON_RESTRICTIONS = [
  { value: 'noSignAndTrade', label: 'No sign-and-trade in' },
  { value: 'noTaxpayerMLE', label: 'No taxpayer mid-level' },
  { value: 'noAggregation', label: 'No salary aggregation in trades' },
  { value: 'takeBackLimit', label: 'Reduced trade take-back' },
  { value: 'frozenDraftPick', label: 'Freeze a future 1st-round pick' },
  { value: 'noBuyoutStretch', label: 'No buyout stretch' },
] as const

export type ApronRestriction = (typeof APRON_RESTRICTIONS)[number]['value']

/** How a draft-pick / asset penalty bites. Informational in MVP. */
export const ASSET_PENALTY_EFFECTS = [
  { value: 'freeze', label: 'Freeze pick (untradeable)' },
  { value: 'dropSpots', label: 'Drop pick N spots' },
  { value: 'forfeit', label: 'Forfeit pick' },
] as const

/** How a floor shortfall is handled. */
export const FLOOR_PENALTIES = [
  { value: 'payShortfall', label: 'Pay the shortfall (to players/league)' },
  { value: 'redistribute', label: 'Redistribute to other clubs' },
  { value: 'draftPenalty', label: 'Lose a draft pick' },
  { value: 'none', label: 'No penalty (advisory only)' },
] as const
