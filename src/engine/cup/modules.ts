// The cup rules. Each one is a small definition with a parameter form and a
// describe() that returns plain sentences for the rulebook.

import { fmtMoney } from '../format'
import { bool, num, str, strList } from '../params'
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
    { key: 'size', label: 'Clubs in each lower competition', type: 'number', default: 24, min: 2 },
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
      `Each lower competition has ${num(p, 'size', 24)} clubs. The clubs that rank next in qualifying enter the next competition down.`,
    ]
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
