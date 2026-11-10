// Shared enums referenced by modules as DATA (so inventing a variant = picking
// different values, not writing code).

/** Restrictions an apron (or spending line) can impose. In MVP these are
 *  informational — they constrain *transactions*, which don't exist yet — so the
 *  apron module surfaces them as warnings/readouts, not hard illegality. */
export const APRON_RESTRICTIONS = [
  { value: 'noSignAndTrade', label: 'No incoming sign-and-trades' },
  { value: 'noTaxpayerMLE', label: 'No taxpayer mid-level exception' },
  { value: 'noAggregation', label: 'No salary aggregation in trades' },
  { value: 'takeBackLimit', label: 'Less salary taken back in trades' },
  { value: 'frozenDraftPick', label: 'Freeze a future 1st-round pick' },
  { value: 'noBuyoutStretch', label: 'No buyout stretch' },
] as const

export type ApronRestriction = (typeof APRON_RESTRICTIONS)[number]['value']

/** How a draft-pick / asset penalty bites. Informational in MVP. */
export const ASSET_PENALTY_EFFECTS = [
  { value: 'freeze', label: 'Pick cannot be traded' },
  { value: 'dropSpots', label: 'Pick moves down' },
  { value: 'forfeit', label: 'Pick is forfeited' },
] as const

/** How a floor shortfall is handled. */
export const FLOOR_PENALTIES = [
  { value: 'payShortfall', label: 'Pay the shortfall to players or the league' },
  { value: 'redistribute', label: 'Pay the shortfall to other clubs' },
  { value: 'draftPenalty', label: 'Lose a draft pick' },
  { value: 'none', label: 'No penalty' },
] as const
