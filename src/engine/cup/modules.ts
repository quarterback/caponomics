// The cup rules. Each one is a small definition with a parameter form and a
// describe() that returns plain sentences for the rulebook.

import { fmtMoney } from '../format'
import { bool, num, objList, str, strList } from '../params'
import type { CupModuleDef } from './types'

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

// ─── Field ───────────────────────────────────────────────────────────────────

export const cupField: CupModuleDef = {
  kind: 'cupField',
  label: 'Teams entered',
  category: 'field',
  blurb: 'Which teams play in the cup.',
  paramSchema: [
    {
      key: 'mode',
      label: 'Who enters',
      type: 'enum',
      options: [
        { value: 'all', label: 'Every team' },
        { value: 'top', label: 'A set number of teams' },
        { value: 'open', label: 'Clubs from several leagues' },
      ],
      default: 'all',
    },
    { key: 'count', label: 'Teams entered', type: 'number', default: 16, min: 2, help: 'Used unless every team enters.' },
    {
      key: 'qualify',
      label: 'How clubs qualify',
      type: 'text',
      default: '',
      placeholder: 'League champions and cup winners from each country',
      help: 'Used when clubs come from several leagues.',
    },
    {
      key: 'basis',
      label: 'How those teams qualify',
      type: 'enum',
      options: [
        { value: 'lastSeason', label: 'Best record last season' },
        { value: 'standings', label: 'Best record on a set date' },
      ],
      default: 'lastSeason',
    },
  ],
  defaultParams: { mode: 'all', count: 16, basis: 'lastSeason', qualify: '' },
  describe(p, ctx) {
    if (str(p, 'mode', 'all') === 'all') return [`All ${ctx.teams} teams enter the cup.`]
    if (str(p, 'mode', 'all') === 'open') {
      const q = str(p, 'qualify', '')
      const lines = [`${num(p, 'count', 16)} clubs from several leagues enter the cup.`]
      if (q) lines.push(`They qualify as follows: ${q}${/[.!?]$/.test(q) ? '' : '.'}`)
      return lines
    }
    const n = Math.min(num(p, 'count', 16), ctx.teams)
    return [
      str(p, 'basis', 'lastSeason') === 'lastSeason'
        ? `The ${n} teams with the best record last season enter the cup.`
        : `The ${n} teams with the best record on a set date enter the cup.`,
    ]
  },
}

/** The 41 Concacaf member associations. The coefficients are placeholders
 *  that only set a starting order. They are not Concacaf's ranking. */
export const CONCACAF_MEMBERS = [
  { name: 'Mexico', coefficient: 92 },
  { name: 'United States', coefficient: 78 },
  { name: 'Costa Rica', coefficient: 46.0 },
  { name: 'Canada', coefficient: 40.5 },
  { name: 'Honduras', coefficient: 35.6 },
  { name: 'Panama', coefficient: 31.3 },
  { name: 'Guatemala', coefficient: 27.6 },
  { name: 'El Salvador', coefficient: 24.3 },
  { name: 'Jamaica', coefficient: 21.4 },
  { name: 'Dominican Republic', coefficient: 18.8 },
  { name: 'Haiti', coefficient: 16.5 },
  { name: 'Trinidad and Tobago', coefficient: 14.6 },
  { name: 'Nicaragua', coefficient: 12.8 },
  { name: 'Suriname', coefficient: 11.3 },
  { name: 'Curaçao', coefficient: 9.9 },
  { name: 'Guadeloupe', coefficient: 8.7 },
  { name: 'Martinique', coefficient: 7.7 },
  { name: 'Cuba', coefficient: 6.8 },
  { name: 'Puerto Rico', coefficient: 5.9 },
  { name: 'Belize', coefficient: 5.2 },
  { name: 'Guyana', coefficient: 4.6 },
  { name: 'French Guiana', coefficient: 4.1 },
  { name: 'Bermuda', coefficient: 3.6 },
  { name: 'Antigua and Barbuda', coefficient: 3.1 },
  { name: 'Saint Kitts and Nevis', coefficient: 2.8 },
  { name: 'Barbados', coefficient: 2.4 },
  { name: 'Grenada', coefficient: 2.1 },
  { name: 'Saint Lucia', coefficient: 1.9 },
  { name: 'Saint Vincent and the Grenadines', coefficient: 1.7 },
  { name: 'Aruba', coefficient: 1.5 },
  { name: 'Dominica', coefficient: 1.3 },
  { name: 'Bonaire', coefficient: 1.1 },
  { name: 'Cayman Islands', coefficient: 1.0 },
  { name: 'Bahamas', coefficient: 0.9 },
  { name: 'Sint Maarten', coefficient: 0.8 },
  { name: 'Saint Martin', coefficient: 0.7 },
  { name: 'Montserrat', coefficient: 0.6 },
  { name: 'Turks and Caicos Islands', coefficient: 0.5 },
  { name: 'British Virgin Islands', coefficient: 0.5 },
  { name: 'US Virgin Islands', coefficient: 0.4 },
  { name: 'Anguilla', coefficient: 0.4 },
]

const DEFAULT_BANDS = [
  { from: 1, to: 2, top: 5, second: 2, third: 1 },
  { from: 3, to: 6, top: 2, second: 2, third: 1 },
  { from: 7, to: 12, top: 1, second: 1, third: 1 },
  { from: 13, to: 24, top: 0, second: 1, third: 1 },
  { from: 25, to: 41, top: 0, second: 0, third: 1 },
]

export interface AccessRow {
  rank: number
  name: string
  coefficient: number
  top: number
  second: number
  third: number
}

/** Rank the associations by coefficient and give each its places. */
export function accessList(p: Record<string, unknown>): AccessRow[] {
  const bands = objList(p, 'bands')
  return objList(p, 'associations')
    .map((a) => ({ name: str(a, 'name', ''), coefficient: num(a, 'coefficient', 0) }))
    .filter((a) => a.name)
    .sort((a, b) => b.coefficient - a.coefficient)
    .map((a, i) => {
      const rank = i + 1
      const band = bands.find((b) => rank >= num(b, 'from', 1) && rank <= num(b, 'to', num(b, 'from', 1)))
      return { rank, ...a, top: band ? num(band, 'top', 0) : 0, second: band ? num(band, 'second', 0) : 0, third: band ? num(band, 'third', 0) : 0 }
    })
}

/** Clubs each competition receives, and how many associations send a club. */
export function placeTotals(p: Record<string, unknown>): { top: number; second: number; third: number; covered: number; members: number } {
  const rows = accessList(p)
  return {
    top: rows.reduce((s, r) => s + r.top, 0),
    second: rows.reduce((s, r) => s + r.second, 0),
    third: rows.reduce((s, r) => s + r.third, 0),
    covered: rows.filter((r) => r.top + r.second + r.third > 0).length,
    members: rows.length,
  }
}

export const associationPlaces: CupModuleDef = {
  kind: 'associationPlaces',
  label: 'Places by association',
  category: 'field',
  blurb: 'How many clubs each member association sends to each competition.',
  paramSchema: [
    {
      key: 'associations',
      label: 'Associations and coefficients',
      type: 'bracketList',
      itemSchema: [
        { key: 'name', label: 'Association', type: 'text', default: '' },
        { key: 'coefficient', label: 'Coefficient', type: 'number', default: 0, min: 0, step: 0.1 },
      ],
      default: CONCACAF_MEMBERS,
      help: 'A higher coefficient ranks higher. The starting values are placeholders.',
    },
    {
      key: 'bands',
      label: 'Places by ranking',
      type: 'bracketList',
      itemSchema: [
        { key: 'from', label: 'From rank', type: 'number', default: 1, min: 1 },
        { key: 'to', label: 'To rank', type: 'number', default: 1, min: 1 },
        { key: 'top', label: 'Top competition', type: 'number', default: 1, min: 0 },
        { key: 'second', label: 'Second', type: 'number', default: 0, min: 0 },
        { key: 'third', label: 'Third', type: 'number', default: 0, min: 0 },
      ],
      default: DEFAULT_BANDS,
    },
  ],
  defaultParams: { associations: CONCACAF_MEMBERS, bands: DEFAULT_BANDS },
  describe(p) {
    const t = placeTotals(p)
    const lines = [`The confederation ranks its ${t.members} member associations by coefficient, highest first.`]
    for (const b of objList(p, 'bands')) {
      const from = num(b, 'from', 1)
      const to = num(b, 'to', from)
      const parts = [
        num(b, 'top', 0) > 0 && `${plural(num(b, 'top', 0), 'club')} to the top competition`,
        num(b, 'second', 0) > 0 && `${num(b, 'second', 0)} to the second`,
        num(b, 'third', 0) > 0 && `${num(b, 'third', 0)} to the third`,
      ].filter(Boolean)
      if (!parts.length) continue
      const who = from === to ? `The association ranked ${from} sends` : `Each association ranked ${from} to ${to} sends`
      lines.push(`${who} ${parts.join(', ')}.`)
    }
    lines.push(
      t.covered >= t.members
        ? `Every member association has at least one club in a competition.`
        : `${t.covered} of the ${t.members} member associations have a club in a competition.`,
    )
    return lines
  },
}

export const coefficientRule: CupModuleDef = {
  kind: 'coefficientRule',
  label: 'Coefficient',
  category: 'field',
  blurb: 'How an association earns the coefficient that sets its ranking.',
  paramSchema: [
    { key: 'win', label: 'Points for a win', type: 'number', default: 2, min: 0, step: 0.5 },
    { key: 'draw', label: 'Points for a draw', type: 'number', default: 1, min: 0, step: 0.5 },
    { key: 'roundBonus', label: 'Bonus for each knockout round reached', type: 'number', default: 1, min: 0, step: 0.5 },
    { key: 'secondWeight', label: 'Weight of second-competition points', type: 'percent', default: 75, min: 0, max: 100 },
    { key: 'thirdWeight', label: 'Weight of third-competition points', type: 'percent', default: 50, min: 0, max: 100 },
    { key: 'perClub', label: 'Divide by the number of clubs entered', type: 'boolean', default: true },
    { key: 'seasons', label: 'Seasons counted', type: 'number', default: 5, min: 1 },
  ],
  defaultParams: { win: 2, draw: 1, roundBonus: 1, secondWeight: 75, thirdWeight: 50, perClub: true, seasons: 5 },
  describe(p) {
    const lines = [
      `A club earns ${num(p, 'win', 2)} points for a win and ${num(p, 'draw', 1)} for a draw in any of the competitions.`,
    ]
    if (num(p, 'roundBonus', 1) > 0) lines.push(`A club earns ${num(p, 'roundBonus', 1)} more for each knockout round it reaches.`)
    lines.push(
      `Points from the second competition count at ${num(p, 'secondWeight', 75)}%. Points from the third count at ${num(p, 'thirdWeight', 50)}%.`,
    )
    lines.push(
      bool(p, 'perClub', true)
        ? 'An association’s score for a season is the total its clubs earn, divided by the number of clubs it entered.'
        : 'An association’s score for a season is the total its clubs earn.',
    )
    const n = num(p, 'seasons', 5)
    lines.push(n === 1 ? 'The coefficient is the score from the last season.' : `The coefficient is the sum of the scores from the last ${n} seasons.`)
    return lines
  },
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export const groupStage: CupModuleDef = {
  kind: 'groupStage',
  label: 'Group stage',
  category: 'groups',
  blurb: 'How many groups, how teams are placed, and how many games they play.',
  paramSchema: [
    { key: 'groups', label: 'Number of groups', type: 'number', default: 6, min: 1 },
    {
      key: 'bound',
      label: 'Groups are drawn within',
      type: 'enum',
      options: [
        { value: 'conference', label: 'Each conference' },
        { value: 'division', label: 'Existing divisions' },
        { value: 'league', label: 'The whole league' },
      ],
      default: 'conference',
    },
    {
      key: 'draw',
      label: 'How teams are placed',
      type: 'enum',
      options: [
        { value: 'pots', label: 'Random draw from pots ranked by last season' },
        { value: 'random', label: 'Random draw' },
        { value: 'fixed', label: 'No draw' },
      ],
      default: 'pots',
    },
    { key: 'meetings', label: 'Times a team plays each group opponent', type: 'number', default: 1, min: 1 },
    { key: 'seriesLength', label: 'Games each time they meet', type: 'number', default: 1, min: 1, help: 'Use 3 for a three-game baseball series.' },
  ],
  defaultParams: { groups: 6, bound: 'conference', draw: 'pots', meetings: 1, seriesLength: 1 },
  describe(p, ctx) {
    const g = Math.max(1, num(p, 'groups', 6))
    const field = ctx.teams
    const lo = Math.floor(field / g)
    const size = field % g === 0 ? `${lo}` : `${lo} or ${lo + 1}`
    const bound = str(p, 'bound', 'conference')
    const draw = str(p, 'draw', 'pots')
    const meetings = num(p, 'meetings', 1)
    const series = num(p, 'seriesLength', 1)
    const lines = [`Teams play in ${plural(g, 'group')} of ${size}.`]
    lines.push(
      bound === 'division'
        ? 'Each existing division is a group.'
        : draw === 'fixed'
          ? `The league assigns the groups within ${bound === 'conference' ? 'each conference' : 'the league'}.`
          : draw === 'pots'
            ? `The league ranks teams by last season’s record, sorts them into pots, and draws one team from each pot into every group${bound === 'conference' ? '. Each group holds teams from one conference' : ''}.`
            : `The league draws the groups at random${bound === 'conference' ? ' within each conference' : ''}.`,
    )
    const meet = meetings === 1 ? 'once' : meetings === 2 ? 'twice, once at home and once away' : `${meetings} times`
    lines.push(
      series > 1
        ? `Each team plays every other team in its group ${meet}. Each meeting is a ${series}-game series.`
        : `Each team plays every other team in its group ${meet}.`,
    )
    return lines
  },
}

export const leaguePhase: CupModuleDef = {
  kind: 'leaguePhase',
  label: 'League phase',
  category: 'groups',
  blurb: 'Teams play a set number of matches and are ranked in a table, with no groups.',
  paramSchema: [
    { key: 'matches', label: 'Matches for each team', type: 'number', default: 6, min: 1 },
    {
      key: 'opponents',
      label: 'Opponents',
      type: 'enum',
      options: [
        { value: 'drawn', label: 'Drawn from seeded pots' },
        { value: 'otherLeague', label: 'Clubs from the other league only' },
      ],
      default: 'drawn',
    },
    {
      key: 'tables',
      label: 'Tables',
      type: 'enum',
      options: [
        { value: 'one', label: 'One table for all teams' },
        { value: 'perLeague', label: 'One table for each league' },
      ],
      default: 'one',
    },
  ],
  defaultParams: { matches: 6, opponents: 'drawn', tables: 'one' },
  describe(p) {
    const n = num(p, 'matches', 6)
    return [
      str(p, 'opponents', 'drawn') === 'otherLeague'
        ? `Each club plays ${plural(n, 'match', 'matches')}, all against clubs from the other league.`
        : `Each team plays ${plural(n, 'match', 'matches')} against different opponents. The draw takes one or more opponents from each seeded pot.`,
      str(p, 'tables', 'one') === 'perLeague' ? 'Each league has its own table.' : 'All teams are ranked in one table.',
    ]
  },
}

export const standings: CupModuleDef = {
  kind: 'standings',
  label: 'Group standings',
  category: 'groups',
  blurb: 'How a group ranks its teams.',
  paramSchema: [
    {
      key: 'system',
      label: 'Teams are ranked by',
      type: 'enum',
      options: [
        { value: 'wins', label: 'Games won' },
        { value: 'series', label: 'Series won' },
        { value: 'points310', label: 'Points: 3 for a win, 1 for a draw' },
        { value: 'points3shootout', label: 'Points: 3 for a win, 2 for a shootout win, 1 for a shootout loss' },
        { value: 'points21', label: 'Points: 2 for a win, 1 for an overtime loss' },
        { value: 'points321', label: 'Points: 3 for a regulation win, 2 for an overtime win, 1 for an overtime loss' },
      ],
      default: 'wins',
    },
  ],
  defaultParams: { system: 'wins' },
  describe(p) {
    const s = str(p, 'system', 'wins')
    return [
      s === 'wins'
        ? 'A group ranks its teams by games won.'
        : s === 'series'
          ? 'A group ranks its teams by series won.'
          : s === 'points310'
            ? 'A team earns 3 points for a win and 1 point for a draw. Teams are ranked by points.'
            : s === 'points3shootout'
              ? 'A team earns 3 points for a win in normal time. A level match goes to a penalty shootout. The shootout winner earns 2 points and the loser earns 1. Teams are ranked by points.'
              : s === 'points21'
            ? 'A team earns 2 points for a win and 1 point for a loss in overtime or a shootout. A group ranks its teams by points.'
            : 'A team earns 3 points for a win in regulation, 2 for a win in overtime or a shootout, and 1 for a loss in overtime or a shootout. A group ranks its teams by points.',
    ]
  },
}

const TIEBREAK_LABEL: Record<string, string> = {
  headToHead: 'the result of the games between the tied teams',
  differential: 'scoring margin in group games',
  scored: 'total scored in group games',
  priorRecord: 'record in the previous regular season',
  random: 'a random draw',
}

export const tiebreakers: CupModuleDef = {
  kind: 'tiebreakers',
  label: 'Tiebreakers',
  category: 'groups',
  blurb: 'How a group separates teams with the same record.',
  paramSchema: [
    {
      key: 'steps',
      label: 'Tiebreakers used, in this order',
      type: 'enumMulti',
      options: [
        { value: 'headToHead', label: 'Head-to-head result' },
        { value: 'differential', label: 'Scoring margin' },
        { value: 'scored', label: 'Total scored' },
        { value: 'priorRecord', label: 'Last season’s record' },
        { value: 'random', label: 'Random draw' },
      ],
      default: ['headToHead', 'differential', 'scored', 'priorRecord', 'random'],
    },
    { key: 'excludeOvertime', label: 'Leave overtime scoring out of the margin and total', type: 'boolean', default: true },
  ],
  defaultParams: { steps: ['headToHead', 'differential', 'scored', 'priorRecord', 'random'], excludeOvertime: true },
  describe(p) {
    const order = ['headToHead', 'differential', 'scored', 'priorRecord', 'random']
    const steps = order.filter((k) => strList(p, 'steps', order).includes(k))
    if (!steps.length) return ['The rules name no tiebreaker.']
    const lines = [`Teams with the same record are separated by, in order: ${steps.map((k) => TIEBREAK_LABEL[k]).join('; ')}.`]
    if (bool(p, 'excludeOvertime', true) && (steps.includes('differential') || steps.includes('scored')))
      lines.push('Scoring in overtime does not count toward the margin or the total.')
    return lines
  },
}

// ─── Advancement ─────────────────────────────────────────────────────────────

export const advancement: CupModuleDef = {
  kind: 'advancement',
  label: 'Who advances',
  category: 'advance',
  blurb: 'How many teams leave the groups for the knockout rounds.',
  paramSchema: [
    { key: 'perGroup', label: 'Teams that advance from each group or table', type: 'number', default: 1, min: 1 },
    { key: 'wildCards', label: 'Wild cards', type: 'number', default: 2, min: 0, help: 'Teams that advance without winning a spot in their group.' },
    {
      key: 'wildScope',
      label: 'Wild cards are chosen from',
      type: 'enum',
      options: [
        { value: 'conference', label: 'Each conference, in equal numbers' },
        { value: 'league', label: 'The whole league' },
      ],
      default: 'conference',
    },
  ],
  defaultParams: { perGroup: 1, wildCards: 2, wildScope: 'conference' },
  describe(p) {
    const per = num(p, 'perGroup', 1)
    const wc = num(p, 'wildCards', 2)
    const lines = [per === 1 ? 'The winner of each group or table advances.' : `The top ${per} teams in each group or table advance.`]
    if (wc > 0) {
      lines.push(
        str(p, 'wildScope', 'conference') === 'conference'
          ? `${plural(wc, 'wild card')} also advance${wc === 1 ? 's' : ''}, split evenly between the conferences. A wild card is the team with the best group record among those that did not advance.`
          : `${plural(wc, 'wild card')} also advance${wc === 1 ? 's' : ''}. A wild card is the team with the best group record among those that did not advance.`,
      )
    }
    return lines
  },
}

// ─── Knockout ────────────────────────────────────────────────────────────────

const FORMAT = [
  { value: 'single', label: 'One game' },
  { value: 'twoLegs', label: 'Two legs, home and away' },
  { value: 'bestOf3', label: 'Best of 3' },
  { value: 'bestOf5', label: 'Best of 5' },
]
const SITE = [
  { value: 'higherSeed', label: 'Home of the higher seed' },
  { value: 'neutral', label: 'Neutral site' },
  { value: 'host', label: 'Chosen by the organiser' },
]
const formatText = (f: string) =>
  f === 'twoLegs' ? 'two legs, one at each team’s home' : f === 'bestOf3' ? 'a best-of-3 series' : f === 'bestOf5' ? 'a best-of-5 series' : 'one game'
const siteText = (s: string) => (s === 'neutral' ? 'at a neutral site' : s === 'host' ? 'at a site the organiser chooses' : 'at the home of the higher seed')
/** "one game, played at a neutral site" or "two legs, one at each team’s home". */
const roundText = (f: string, s: string) => (f === 'twoLegs' ? formatText(f) : `${formatText(f)}, played ${siteText(s)}`)
export const formatGames = (f: string) => (f === 'twoLegs' ? 2 : f === 'bestOf3' ? 3 : f === 'bestOf5' ? 5 : 1)

export const knockout: CupModuleDef = {
  kind: 'knockout',
  label: 'Knockout rounds',
  category: 'knockout',
  blurb: 'How the advancing teams play down to a champion.',
  paramSchema: [
    { key: 'earlyFormat', label: 'Rounds before the semifinals', type: 'enum', options: FORMAT, default: 'single' },
    { key: 'earlySite', label: 'Where those rounds are played', type: 'enum', options: SITE, default: 'higherSeed' },
    { key: 'semiFormat', label: 'Semifinals', type: 'enum', options: FORMAT, default: 'single' },
    { key: 'finalFormat', label: 'Final', type: 'enum', options: FORMAT, default: 'single' },
    { key: 'lateSite', label: 'Where the semifinals and final are played', type: 'enum', options: SITE, default: 'neutral' },
    { key: 'byes', label: 'Teams that skip the first knockout round', type: 'number', default: 0, min: 0 },
    { key: 'byeFor', label: 'Who skips it', type: 'text', default: '', placeholder: 'The champions of the main qualifying competitions' },
    { key: 'thirdPlace', label: 'Losing semifinalists play for third place', type: 'boolean', default: false },
  ],
  defaultParams: { earlyFormat: 'single', earlySite: 'higherSeed', semiFormat: 'single', finalFormat: 'single', lateSite: 'neutral', byes: 0, byeFor: '', thirdPlace: false },
  describe(p) {
    const lines = ['Teams that lose a knockout round are out.']
    const byes = num(p, 'byes', 0)
    if (byes > 0) {
      const who = str(p, 'byeFor', '')
      lines.push(`${plural(byes, 'team')} skip${byes === 1 ? 's' : ''} the first knockout round${who ? `: ${who}` : ''}.`)
    }
    lines.push(`Each round before the semifinals is ${roundText(str(p, 'earlyFormat', 'single'), str(p, 'earlySite', 'higherSeed'))}.`)
    const semi = str(p, 'semiFormat', 'single')
    const fin = str(p, 'finalFormat', 'single')
    const late = str(p, 'lateSite', 'neutral')
    lines.push(
      semi === fin
        ? `Each semifinal and the final are ${roundText(semi, late)}.`
        : `Each semifinal is ${roundText(semi, late)}. The final is ${roundText(fin, late)}.`,
    )
    if (bool(p, 'thirdPlace', false)) lines.push('The two losing semifinalists play one match for third place.')
    return lines
  },
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export const seasonCount: CupModuleDef = {
  kind: 'seasonCount',
  label: 'Regular-season record',
  category: 'schedule',
  blurb: 'Which cup games also count in the regular-season standings.',
  paramSchema: [
    { key: 'group', label: 'Group games count', type: 'boolean', default: true },
    { key: 'knockout', label: 'Knockout games before the final count', type: 'boolean', default: true },
    { key: 'final', label: 'The final counts', type: 'boolean', default: false },
  ],
  defaultParams: { group: true, knockout: true, final: false },
  describe(p) {
    const g = bool(p, 'group', true)
    const k = bool(p, 'knockout', true)
    const f = bool(p, 'final', false)
    if (g && k && f) return ['Every cup game counts in the regular-season standings.']
    if (!g && !k && !f) return ['No cup game counts in the regular-season standings. Teams play every cup game in addition to their schedule.']
    const yes = [g && 'group games', k && 'knockout games before the final', f && 'the final'].filter(Boolean)
    const no = [!g && 'group games', !k && 'knockout games before the final', !f && 'the final'].filter(Boolean)
    return [
      `These count in the regular-season standings: ${yes.join(' and ')}.`,
      `These do not count, so teams play them in addition to their schedule: ${no.join(' and ')}.`,
    ]
  },
}

// ─── Prize ───────────────────────────────────────────────────────────────────

export const prizeMoney: CupModuleDef = {
  kind: 'prizeMoney',
  label: 'Prize money',
  category: 'prize',
  blurb: 'What each player receives for how far the team goes.',
  paramSchema: [
    { key: 'firstRound', label: 'Each player on a team that loses the first knockout round', type: 'money', default: 53093, min: 0 },
    { key: 'semifinal', label: 'Each player on a team that loses a semifinal', type: 'money', default: 106187, min: 0 },
    { key: 'runnerUp', label: 'Each player on the losing finalist', type: 'money', default: 0, min: 0 },
    { key: 'champion', label: 'Each player on the champion', type: 'money', default: 530933, min: 0 },
    { key: 'countsOnCap', label: 'Prize money counts against the salary cap', type: 'boolean', default: false },
  ],
  defaultParams: { firstRound: 53093, semifinal: 106187, runnerUp: 0, champion: 530933, countsOnCap: false },
  describe(p, ctx) {
    const m = (k: string) => num(p, k, 0)
    const f = (v: number) => fmtMoney(v, ctx.currency)
    const parts = [
      m('champion') > 0 && `${f(m('champion'))} on the champion`,
      m('runnerUp') > 0 && `${f(m('runnerUp'))} on the losing finalist`,
      m('semifinal') > 0 && `${f(m('semifinal'))} on a team that loses a semifinal`,
      m('firstRound') > 0 && `${f(m('firstRound'))} on a team that loses the first knockout round`,
    ].filter(Boolean)
    if (!parts.length) return ['The cup pays no prize money.']
    return [
      `Each player receives: ${parts.join('; ')}.`,
      bool(p, 'countsOnCap', false) ? 'Prize money counts against the team’s salary cap.' : 'Prize money does not count against the team’s salary cap.',
    ]
  },
}

export const winnerReward: CupModuleDef = {
  kind: 'winnerReward',
  label: 'Reward for the champion',
  category: 'prize',
  blurb: 'What the champion earns beyond prize money.',
  paramSchema: [
    {
      key: 'type',
      label: 'The champion receives',
      type: 'enum',
      options: [
        { value: 'playoffBerth', label: 'A place in the playoffs' },
        { value: 'continental', label: 'Places in a higher competition' },
        { value: 'seeding', label: 'The first playoff seeding tiebreaker' },
        { value: 'draftPick', label: 'An extra draft pick' },
        { value: 'capException', label: 'Extra room above the salary cap' },
        { value: 'taxRelief', label: 'A reduction in luxury tax' },
      ],
      default: 'seeding',
    },
    { key: 'amount', label: 'Amount of cap room or tax reduction', type: 'money', default: 5000000, min: 0 },
    { key: 'round', label: 'Round of the extra draft pick', type: 'number', default: 2, min: 1 },
    { key: 'places', label: 'Teams that earn a place in the higher competition', type: 'number', default: 1, min: 1 },
    { key: 'competition', label: 'Name of the higher competition', type: 'text', default: '', placeholder: 'Champions Cup' },
  ],
  defaultParams: { type: 'seeding', amount: 5000000, round: 2, places: 1, competition: '' },
  describe(p, ctx) {
    const t = str(p, 'type', 'seeding')
    const amt = fmtMoney(num(p, 'amount', 0), ctx.currency)
    if (t === 'continental') {
      const places = num(p, 'places', 1)
      const comp = str(p, 'competition', '') || 'a higher competition'
      return [places === 1 ? `The champion earns a place in next season’s ${comp}.` : `The top ${places} teams earn places in next season’s ${comp}.`]
    }
    return [
      t === 'playoffBerth'
        ? 'The champion earns a place in the playoffs.'
        : t === 'seeding'
          ? 'If the champion finishes level with another team in the standings, the champion takes the higher playoff seed.'
          : t === 'draftPick'
            ? `The champion receives an extra pick at the end of round ${num(p, 'round', 2)} of the next draft.`
            : t === 'capException'
              ? `The champion may spend ${amt} above the salary cap next season.`
              : `The league reduces the champion’s luxury tax bill by ${amt}.`,
    ]
  },
}

// ─── Tiers ───────────────────────────────────────────────────────────────────

export const tiers: CupModuleDef = {
  kind: 'tiers',
  label: 'Lower competitions',
  category: 'tiers',
  blurb: 'Second and third competitions for clubs that miss the top one.',
  paramSchema: [
    { key: 'count', label: 'Competitions below the top one', type: 'number', default: 2, min: 1, max: 3 },
    { key: 'size', label: 'Clubs in each lower competition', type: 'number', default: 24, min: 0, help: 'Use 0 when places by association set the sizes.' },
    { key: 'names', label: 'Names, from the top down', type: 'text', default: 'Champions Cup, Shield, Conference Cup' },
    { key: 'dropDown', label: 'Clubs knocked out early drop to the next competition', type: 'boolean', default: true },
    { key: 'promote', label: 'A winner earns a place one competition higher next season', type: 'boolean', default: true },
  ],
  defaultParams: { count: 2, size: 24, names: 'Champions Cup, Shield, Conference Cup', dropDown: true, promote: true },
  describe(p) {
    const count = num(p, 'count', 2)
    const names = str(p, 'names', '').split(',').map((x) => x.trim()).filter(Boolean)
    const lines = [
      `${plural(count, 'lower competition')} run${count === 1 ? 's' : ''} beside the top one${names.length ? `. From the top down, the competitions are: ${names.join(', ')}` : ''}.`,
    ]
    if (num(p, 'size', 24) > 0)
      lines.push(`Each lower competition has ${num(p, 'size', 24)} clubs. The clubs that rank next in qualifying enter the next competition down.`)
    if (bool(p, 'dropDown', true)) lines.push('A club knocked out before the knockout rounds of one competition enters the knockout rounds of the next one down.')
    if (bool(p, 'promote', true)) lines.push('The winner of a lower competition earns a place one competition higher next season.')
    return lines
  },
}

// ─── Special ─────────────────────────────────────────────────────────────────

export const cupHouseRule: CupModuleDef = {
  kind: 'cupHouseRule',
  label: 'Your own rule',
  category: 'special',
  blurb: 'Write a rule in your own words.',
  paramSchema: [
    { key: 'title', label: 'Rule name', type: 'text', default: 'Extra rule' },
    { key: 'note', label: 'The rule', type: 'text', default: '', placeholder: 'Group games are played on Tuesdays and Fridays.' },
  ],
  defaultParams: { title: 'Extra rule', note: '' },
  describe(p) {
    const note = str(p, 'note', '')
    return note ? [`${str(p, 'title', 'Extra rule')}: ${note}`] : []
  },
}

/** Teams in the cup, given the league size and the field rule's params. */
export function entered(leagueTeams: number, field: Record<string, unknown> | null): number {
  if (!field || str(field, 'mode', 'all') === 'all') return leagueTeams
  if (str(field, 'mode', 'all') === 'open') return Math.max(2, num(field, 'count', 16))
  return Math.max(2, Math.min(num(field, 'count', 16), leagueTeams))
}
