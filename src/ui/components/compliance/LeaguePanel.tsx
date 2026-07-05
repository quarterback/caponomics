import { useMemo, useState } from 'react'
import { summarizeLeague } from '../../../engine/summary'
import { useStore } from '../../state/store'
import { LeagueSummary } from './LeagueSummary'
import { LeagueTable } from './LeagueTable'
import { ComplianceSummary } from './ComplianceSummary'
import { CapSheet } from './CapSheet'

export function LeaguePanel() {
  const { report, league, selectedTeamId } = useStore()
  const summary = useMemo(() => summarizeLeague(report), [report])
  const [showSheet, setShowSheet] = useState(false)

  const teamReport =
    report.byTeamYear.find((t) => t.teamId === selectedTeamId) ?? report.byTeamYear[0]

  return (
    <div className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">League overview</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{league.name}</span>
        </div>
        <div className="card__body" style={{ display: 'grid', gap: 'var(--s4)' }}>
          <LeagueSummary s={summary} />
          <LeagueTable rows={summary.teams} />
        </div>
      </div>

      {teamReport && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">{teamReport.teamName}</span>
            <button
              className="btn btn--sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => setShowSheet((v) => !v)}
            >
              {showSheet ? 'Hide cap sheet' : 'View cap sheet'}
            </button>
          </div>
          <div className="card__body" style={{ display: 'grid', gap: 'var(--s4)' }}>
            <ComplianceSummary report={teamReport} />
            {showSheet && <CapSheet report={teamReport} league={league} />}
          </div>
        </div>
      )}
    </div>
  )
}
