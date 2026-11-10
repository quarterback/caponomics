import { CUP_CATALOG } from '../../../engine/cup/catalog'
import { CUP_CATEGORY_LABEL, CUP_CATEGORY_ORDER } from '../../../engine/cup/summary'
import { CUP_PRESETS, CUP_PRESET_LEAGUE } from '../../../presets/cup'
import { ROSTERS, ROSTER_GROUPS } from '../../../data/rosters'
import { useCup } from '../../state/cupStore'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'

export function CupRail() {
  const { model, forked, loadPreset, addRule } = useCup()
  const { rosterId, loadRoster } = useStore()
  return (
    <div className="col" style={{ paddingRight: 2 }}>
      <div className="rail__group">
        <div className="rail__label">Cup Format</div>
        <div className="rail__items">
          {CUP_PRESETS.map((p) => (
            <button key={p.id} className="preset-btn" data-active={model.id === p.id && !forked} onClick={() => {
                loadPreset(p.id)
                const league = CUP_PRESET_LEAGUE[p.id]
                if (league) loadRoster(league)
              }}
            >
              <strong>{p.name}</strong>
              <span>{p.sport}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rail__group">
        <div className="rail__label">Add a rule</div>
        {CUP_CATEGORY_ORDER.map((cat) => {
          const rules = CUP_CATALOG.filter((m) => m.category === cat)
          if (!rules.length) return null
          return (
            <div className="palette__cat" key={cat}>
              <h4>{CUP_CATEGORY_LABEL[cat]}</h4>
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
        <div className="rail__label">League</div>
        <div className="field__help" style={{ padding: '0 2px 6px' }}>
          The tool uses this league’s number of teams. The Cap System tab uses the same league.
        </div>
        {ROSTER_GROUPS.map((group) => (
          <div className="rail__subgroup" key={group}>
            <div className="rail__sublabel">{group}</div>
            <div className="rail__items">
              {ROSTERS.filter((r) => r.group === group).map((r) => (
                <button key={r.id} className="preset-btn preset-btn--row" data-active={rosterId === r.id} onClick={() => loadRoster(r.id)}>
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
