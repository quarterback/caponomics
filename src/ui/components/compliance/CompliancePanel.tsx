import { useStore } from '../../state/store'
import { CapSheet } from './CapSheet'
import { ComplianceSummary } from './ComplianceSummary'
import { MetricTiles } from './MetricTiles'
import { TeamPicker } from './TeamPicker'

export function CompliancePanel() {
  const { report, selectedTeamId, league } = useStore()
  const teamReport =
    report.byTeamYear.find((t) => t.teamId === selectedTeamId) ?? report.byTeamYear[0]

  return (
    <div className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">Compliance</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
            {league.name}
          </span>
        </div>
        <div className="card__body" style={{ display: 'grid', gap: 'var(--s4)' }}>
          <TeamPicker />
          {teamReport ? (
            <>
              <ComplianceSummary report={teamReport} />
              <MetricTiles report={teamReport} />
            </>
          ) : (
            <div className="empty-note">No teams in this roster.</div>
          )}
        </div>
      </div>

      {teamReport && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Cap sheet · {teamReport.teamName}</span>
          </div>
          <div className="card__body">
            <CapSheet report={teamReport} league={league} />
          </div>
        </div>
      )}
    </div>
  )
}
