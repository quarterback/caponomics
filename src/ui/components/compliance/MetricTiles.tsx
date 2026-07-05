import { fmtMoney } from '../../../engine/format'
import type { Readout, TeamYearReport } from '../../../engine/types'

type Tone = 'good' | 'bad' | 'warn' | undefined

function toneFor(r: Readout): Tone {
  if (r.label === 'Tax owed') return r.value > 0 ? 'warn' : undefined
  if (r.label === 'Floor gap') return r.value > 0 ? 'bad' : 'good'
  if (r.label === 'Hard cap room') return r.value < 0 ? 'bad' : 'good'
  if (r.label.startsWith('Apron')) return r.value < 0 ? 'warn' : undefined
  return undefined
}

function fmt(r: Readout): string {
  if (r.format === 'money') {
    // Floor gap / cap room read more naturally as "under/over".
    if (r.label === 'Floor gap') return r.value > 0 ? `−${fmtMoney(r.value)}` : 'OK'
    if (r.label === 'Hard cap room') return r.value < 0 ? `−${fmtMoney(-r.value)}` : fmtMoney(r.value)
    if (r.label.startsWith('Apron')) return r.value < 0 ? `over ${fmtMoney(-r.value)}` : fmtMoney(r.value)
    return fmtMoney(r.value)
  }
  if (r.format === 'percent') return `${r.value}%`
  return String(r.value)
}

export function MetricTiles({ report }: { report: TeamYearReport }) {
  // De-dupe readouts by label (last wins) to avoid repeats from multiple modules.
  const byLabel = new Map<string, Readout>()
  for (const r of report.readouts) byLabel.set(r.label, r)
  const readouts = [...byLabel.values()]

  return (
    <div className="tiles">
      <div className="tile">
        <div className="tile__label">Cap line</div>
        <div className="tile__value mono">{report.capValue === null ? '—' : fmtMoney(report.capValue)}</div>
      </div>
      <div className="tile">
        <div className="tile__label">Team salary</div>
        <div className="tile__value mono">{fmtMoney(report.totals.capSalary)}</div>
      </div>
      {readouts.map((r) => (
        <div className="tile" key={r.label}>
          <div className="tile__label">{r.label}</div>
          <div className="tile__value mono" data-tone={toneFor(r)}>
            {fmt(r)}
          </div>
        </div>
      ))}
    </div>
  )
}
