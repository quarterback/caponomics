import { useStore } from '../../state/store'

export function TeamPicker() {
  const { report, selectedTeamId, selectTeam, league } = useStore()
  // One row per team (first evaluated year).
  const seen = new Set<string>()
  const teams = report.byTeamYear.filter((t) => {
    if (seen.has(t.teamId)) return false
    seen.add(t.teamId)
    return true
  })
  if (teams.length <= 1) return null
  return (
    <div className="team-pills">
      {teams.map((t) => (
        <button
          key={t.teamId}
          className="team-pill"
          data-active={t.teamId === selectedTeamId}
          onClick={() => selectTeam(t.teamId)}
        >
          <span className="status-dot" data-legal={t.legal} />
          {league.teams.find((x) => x.id === t.teamId)?.name ?? t.teamName}
        </button>
      ))}
    </div>
  )
}
