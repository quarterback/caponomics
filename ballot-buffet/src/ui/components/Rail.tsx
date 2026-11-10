import { PROFILES } from '../../engine/profiles'
import { REAL_SETS } from '../../engine/real'
import { SYSTEM_GROUPS } from '../../engine/systems'
import { useStore } from '../store'

export function Rail() {
  const { system, forked, profile, loadSystem, loadProfile, loadRealSet, loading, loadError } = useStore()
  return (
    <aside className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">Counting Systems</span>
        </div>
        <div className="card__body">
          {SYSTEM_GROUPS.map((g) => (
            <div className="rail__group" key={g.label}>
              <div className="rail__label">{g.label}</div>
              {g.systems.map((s) => (
                <button key={s.id} className="preset-btn" data-active={s.id === system.id && !forked} onClick={() => loadSystem(s)}>
                  <strong>{s.name}</strong>
                  <span>{s.blurb}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Ballots</span>
        </div>
        <div className="card__body">
          <div className="rail__group">
            <div className="rail__label">Portland 2024, real ballots</div>
            {REAL_SETS.map((r) => (
              <button key={r.id} className="preset-btn" data-active={r.id === profile.id} disabled={loading !== null} onClick={() => void loadRealSet(r)}>
                <strong>{r.name}</strong>
                <span>{loading === r.id ? 'Loading the ballots.' : r.blurb}</span>
              </button>
            ))}
            {loadError && <div className="field__err">{loadError}</div>}
          </div>
          <div className="rail__group">
            <div className="rail__label">Test sets</div>
          {PROFILES.map((p) => (
            <button key={p.id} className="preset-btn" data-active={p.id === profile.id} onClick={() => loadProfile(p)}>
              <strong>{p.name}</strong>
              <span>{p.blurb}</span>
            </button>
          ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
