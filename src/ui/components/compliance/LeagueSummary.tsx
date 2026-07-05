import { fmtMoney } from '../../../engine/format'
import type { LeagueSummary as Summary } from '../../../engine/summary'
import { useStore } from '../../state/store'

export function LeagueSummary({ s }: { s: Summary }) {
  const cur = useStore((st) => st.league.currency ?? 'USD')
  const stat = (label: string, value: string, tone?: 'good' | 'bad' | 'warn', sub?: string) => (
    <div className="tile">
      <div className="tile__label">{label}</div>
      <div className="tile__value mono" data-tone={tone}>
        {value}
      </div>
      {sub && <div className="tile__sub">{sub}</div>}
    </div>
  )

  const apronTotal = Object.values(s.apronCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="lsummary">
      {stat('Illegal', `${s.illegalCount}`, s.illegalCount ? 'bad' : 'good', `of ${s.teamCount} teams`)}
      {stat('Over cap', `${s.overCapCount}`, undefined, `of ${s.teamCount}`)}
      {stat('Below floor', `${s.belowFloorCount}`, s.belowFloorCount ? 'warn' : undefined, `of ${s.teamCount}`)}
      {stat('In tax', `${s.inTaxCount}`, undefined, `owe ${fmtMoney(s.totalTax, cur)}`)}
      {apronTotal > 0 && stat('Over an apron', `${apronTotal}`, 'warn', apronDetail(s.apronCounts))}
      {stat('Payroll spread', `${fmtMoney(s.payrollMin, cur)}–${fmtMoney(s.payrollMax, cur)}`, undefined, `avg ${fmtMoney(s.payrollAvg, cur)}`)}
      {stat('Balance', `${Math.round(s.payrollCV * 100)}%`, undefined, 'payroll variation')}
    </div>
  )
}

function apronDetail(counts: Record<number, number>): string {
  return Object.entries(counts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([lvl, n]) => `${n} over A${lvl}`)
    .join(' · ')
}
