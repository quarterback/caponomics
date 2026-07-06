// The family of sibling tools — cross-navigation links.
//
// SINGLE SOURCE OF TRUTH for family URLs. The current host (giantplanet.org) is
// temporary; when the family consolidates under capbuffet.com — e.g. a subdomain
// like lottery.capbuffet.com pointed at Lottery Lab — update the `url`s here only.

export interface FamilyTool {
  id: string
  name: string
  blurb: string
  url: string
  /** The tool currently being viewed (shown as "you are here", not a link). */
  current?: boolean
}

export const FAMILY_TOOLS: FamilyTool[] = [
  { id: 'cap-buffet', name: 'Cap Buffet', blurb: 'Salary cap imagineering', url: '', current: true },
  { id: 'lottery-lab', name: 'Lottery Lab', blurb: 'Draft-lottery simulator', url: 'https://giantplanet.org/' },
  // Expansion Draft — add the URL when it's live (ideally a capbuffet.com subdomain):
  // { id: 'expansion-draft', name: 'Expansion Draft', blurb: 'Build an expansion roster', url: '' },
]
