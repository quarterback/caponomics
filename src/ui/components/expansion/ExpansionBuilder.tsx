import { EXPANSION_MAP } from '../../../engine/expansion/catalog'
import { useExpansion } from '../../state/expansionStore'
import { NumberInput } from '../primitives'
import { ModuleCard } from '../workspace/ModuleCard'

export function ExpansionBuilder() {
  const { model, setTeamsAdded, toggleRule, removeRule, moveRule, updateParam } = useExpansion()
  const actions = { toggle: toggleRule, remove: removeRule, move: moveRule, updateParam }

  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Expansion model</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
          {model.modules.filter((m) => m.enabled).length} active · {model.modules.length} total
        </span>
      </div>
      <div className="card__body">
        <div className="field" style={{ marginBottom: 'var(--s3)' }}>
          <label>New teams joining at once</label>
          <NumberInput value={model.teamsAdded} min={1} max={8} onChange={setTeamsAdded} />
          <div className="field__help">
            Historically 1 (NHL, NBA, MLS) or 2 (MLB 1997, WNBA 2026). Rules like Multi-Team Format only
            bite at 2+.
          </div>
        </div>

        {model.modules.length === 0 ? (
          <div className="builder__empty">
            <strong>An empty expansion model.</strong>
            Add rules from the palette on the left, or load a historical model. The rulebook on the right
            rewrites itself as you mix and match.
          </div>
        ) : (
          <div className="builder">
            {model.modules.map((m, i) => {
              const def = EXPANSION_MAP[m.kind]
              if (!def) return null
              return <ModuleCard key={m.id} def={def} instance={m} index={i} count={model.modules.length} actions={actions} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
