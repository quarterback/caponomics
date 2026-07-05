import { useMemo, useState } from 'react'
import { fmtMoney } from '../../../engine/format'
import type { TeamRow } from '../../../engine/summary'
import { useStore } from '../../state/store'

type SortKey = 'team' | 'payroll' | 'vsCap' | 'tax' | 'floor' | 'apron' | 'status'

export function LeagueTable({ rows }: { rows: TeamRow[] }) {
  const { selectedTeamId, selectTeam } = useStore()
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'payroll', dir: -1 })

  const sorted = useMemo(() => {
    const val = (r: TeamRow): number | string => {
      switch (sort.key) {
        case 'team': return r.teamName
        case 'payroll': return r.payroll
        case 'vsCap': return r.vsCap ?? -Infinity
        case 'tax': return r.tax
        case 'floor': return r.floorGap
        case 'apron': return r.apronLevel
        case 'status': return r.legal ? 1 : 0
      }
    }
    return [...rows].sort((a, b) => {
      const av = val(a)
      const bv = val(b)
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return cmp * sort.dir
    })
  }, [rows, sort])

  const th = (key: SortKey, label: string, align: 'l' | 'r' = 'r') => (
    <th data-align={align} onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === -1 ? 1 : -1 }))}>
      {label}
      {sort.key === key && <span className="sort-caret">{sort.dir === -1 ? '▾' : '▴'}</span>}
    </th>
  )

  return (
    <div className="ltable-wrap">
      <table className="ltable">
        <thead>
          <tr>
            {th('team', 'Team', 'l')}
            {th('payroll', 'Payroll')}
            {th('vsCap', 'vs Cap')}
            {th('tax', 'Tax')}
            {th('floor', 'Floor')}
            {th('apron', 'Apron')}
            {th('status', 'Status', 'l')}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.teamId}
              data-active={r.teamId === selectedTeamId}
              onClick={() => selectTeam(r.teamId)}
            >
              <td data-align="l" className="tname">{r.teamName}</td>
              <td className="mono">{fmtMoney(r.payroll)}</td>
              <td className="mono" data-tone={r.vsCap !== null && r.vsCap > 0 ? 'bad' : undefined}>
                {r.vsCap === null ? '—' : r.vsCap > 0 ? `+${fmtMoney(r.vsCap)}` : `−${fmtMoney(-r.vsCap)}`}
              </td>
              <td className="mono" data-tone={r.tax > 0 ? 'warn' : undefined}>
                {r.tax > 0 ? fmtMoney(r.tax) : '—'}
              </td>
              <td className="mono" data-tone={r.floorGap > 0 ? 'bad' : undefined}>
                {r.floorGap > 0 ? `−${fmtMoney(r.floorGap)}` : 'OK'}
              </td>
              <td>
                {r.apronLevel > 0 ? <span className="apron-badge">A{r.apronLevel}</span> : <span className="dim">—</span>}
                {(r.hasAssetPenalty || r.hasToolPenalty) && <span className="pen-dot" title="roster/asset penalty" />}
              </td>
              <td data-align="l">
                <span className="status-dot" data-legal={r.legal} />
                <span className="status-txt" data-legal={r.legal}>{r.legal ? 'Legal' : 'Illegal'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
