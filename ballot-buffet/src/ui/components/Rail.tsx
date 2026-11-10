import { PROFILES } from '../../engine/profiles'
import { SYSTEM_GROUPS } from '../../engine/systems'
import { useStore } from '../store'

export function Rail() {
  const { system, forked, profile, loadSystem, loadProfile } = useStore()
  return (
    <aside className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">Counting systems</span>
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
          <span className="card__title">Ballot sets</span>
        </div>
        <div className="card__body">
          {PROFILES.map((p) => (
            <button key={p.id} className="preset-btn" data-active={p.id === profile.id} onClick={() => loadProfile(p)}>
              <strong>{p.name}</strong>
              <span>{p.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
