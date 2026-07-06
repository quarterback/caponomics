// The family of sibling tools — cross-navigation links.
//
// SINGLE SOURCE OF TRUTH for family URLs. The family now lives under
// capbuffet.com (Lottery Lab at lottery.capbuffet.com); update the `url`s here
// only if a tool moves.

export interface FamilyTool {
  id: string
  name: string
  blurb: string
  url: string
  /** The tool currently being viewed (shown as "you are here", not a link). */
  current?: boolean
}

export const FAMILY_TOOLS: FamilyTool[] = [
  { id: 'cap-buffet', name: 'Cap Buffet', blurb: 'Salary cap imagineering', url: 'https://capbuffet.com/', current: true },
  { id: 'lottery-lab', name: 'Lottery Lab', blurb: 'Draft-lottery simulator', url: 'https://lottery.capbuffet.com/' },
  // Expansion Draft — add the URL when it's live (ideally a capbuffet.com subdomain):
  // { id: 'expansion-draft', name: 'Expansion Draft', blurb: 'Build an expansion roster', url: '' },
]
