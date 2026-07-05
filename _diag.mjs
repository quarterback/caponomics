import { evaluateRuleset } from './src/engine/evaluate.ts'
import { PRESET_MAP } from './src/presets/index.ts'
import { mlbSample, nbaSample } from './src/data/rosters/index.ts'
for (const [label, league, preset] of [['MLB', mlbSample, 'mlb-2026'], ['NBA', nbaSample, 'nba-2026']]) {
  const r = evaluateRuleset(league, PRESET_MAP[preset])
  console.log('\n=== ' + label + ' ===')
  for (const t of r.byTeamYear) {
    const tax = t.readouts.find(x=>x.label==='Tax owed')?.value||0
    console.log(`${t.teamId.padEnd(4)} $${(t.totals.capSalary/1e6).toFixed(0).padStart(3)}M  ${t.legal?'LEGAL ':'ILLEGAL'}  tax:$${(tax/1e6).toFixed(1)}M  flags:${t.flags.join(',')||'-'}`)
  }
}
