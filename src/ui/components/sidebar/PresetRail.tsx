import { PRESETS } from '../../../presets'
import { ROSTERS } from '../../../data/rosters'
import { useStore } from '../../state/store'
import { ModulePalette } from './ModulePalette'

export function PresetRail() {
  const { ruleset, rosterId, loadPreset, loadRoster } = useStore()

  return (
    <div className="col" style={{ paddingRight: 2 }}>
      <div className="rail__group">
        <div className="rail__label">Cap systems</div>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className="preset-btn"
            data-active={ruleset.id === p.id}
            onClick={() => loadPreset(p.id)}
          >
            <strong>{p.name}</strong>
            <span>{p.sport}</span>
          </button>
        ))}
      </div>

      <div className="rail__group">
        <div className="rail__label">Roster to test</div>
        {ROSTERS.map((r) => (
          <button
            key={r.id}
            className="preset-btn"
            data-active={rosterId === r.id}
            onClick={() => loadRoster(r.id)}
          >
            <strong>{r.label}</strong>
          </button>
        ))}
      </div>

      <ModulePalette />
    </div>
  )
}
