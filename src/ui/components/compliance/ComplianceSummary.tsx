import { fmtMoney } from '../../../engine/format'
import type { TeamYearReport } from '../../../engine/types'

export function ComplianceSummary({ report }: { report: TeamYearReport }) {
  const errors = report.reasons.filter((r) => r.severity === 'error')
  const warnings = report.reasons.filter((r) => r.severity === 'warning')
  const infos = report.reasons.filter((r) => r.severity === 'info')
  const ordered = [...errors, ...warnings, ...infos]

  return (
    <div>
      <div className="verdict" data-legal={report.legal}>
        <span className="status-dot" data-legal={report.legal} style={{ width: 10, height: 10 }} />
        {report.legal ? 'Legal under this cap system' : 'Illegal under this cap system'}
        <span className="badge-pill">
          {errors.length ? `${errors.length} violation${errors.length > 1 ? 's' : ''}` : 'compliant'}
        </span>
      </div>

      {report.penalties.length > 0 && (
        <>
          <div className="section-label">Penalties</div>
          <div className="penalty-chips">
            {report.penalties.map((p, i) => (
              <span className="pchip" data-cur={p.currency} key={i} title={p.description}>
                {p.currency === 'money' && p.amount !== undefined ? fmtMoney(p.amount) : p.currency}
                {p.currency !== 'money' ? '' : ' tax'}
              </span>
            ))}
          </div>
        </>
      )}

      {ordered.length > 0 && (
        <>
          <div className="section-label">Notes</div>
          <div className="reasons">
            {ordered.map((r, i) => (
              <div className="reason" data-sev={r.severity} key={i}>
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
