import { EXPANSION_CATALOG } from '../../../engine/expansion/catalog'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../../../engine/expansion/summary'
import { EXPANSION_PRESETS } from '../../../presets/expansion'
import { ROSTERS, ROSTER_GROUPS } from '../../../data/rosters'
import { useExpansion } from '../../state/expansionStore'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'

export function ExpansionRail() {
  const { model, loadPreset, addRule } = useExpansion()
  const { rosterId, loadRoster } = useStore()

  return (
    <div className="col" style={{ paddingRight: 2 }}>
      <div className="rail__group">
        <div className="rail__label">Draft models</div>
        <div className="rail__items">
          {EXPANSION_PRESETS.map((p) => (
            <button
              key={p.id}
              className="preset-btn"
              data-active={model.id === p.id}
              onClick={() => loadPreset(p.id)}
            >
              <strong>{p.name}</strong>
              <span>{p.sport}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rail__group">
        <div className="rail__label">Add a rule</div>
        {CATEGORY_ORDER.map((cat) => {
          const rules = EXPANSION_CATALOG.filter((m) => m.category === cat)
          if (!rules.length) return null
          return (
            <div className="palette__cat" key={cat}>
              <h4>{CATEGORY_LABEL[cat]}</h4>
              {rules.map((m) => (
                <button key={m.kind} className="palette__item" title={m.blurb} onClick={() => addRule(m.kind)}>
                  <span className="cat-dot" style={{ background: catColor(m.category) }} />
                  {m.label}
                  <span className="plus">+</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <div className="rail__group">
        <div className="rail__label">League context</div>
        <div className="field__help" style={{ padding: '0 2px 6px' }}>
          Sets the existing-team count the summary's quick math uses. Shared with the Cap System tab.
        </div>
        {ROSTER_GROUPS.map((group) => (
          <div className="rail__subgroup" key={group}>
            <div className="rail__sublabel">{group}</div>
            <div className="rail__items">
              {ROSTERS.filter((r) => r.group === group).map((r) => (
                <button
                  key={r.id}
                  className="preset-btn preset-btn--row"
                  data-active={rosterId === r.id}
                  onClick={() => loadRoster(r.id)}
                >
                  <strong>{r.label}</strong>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
