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
        <span className="card__title">What rules does this draft have?</span>
      </div>
      <div className="card__body">
        <div className="field" style={{ marginBottom: 'var(--s3)' }}>
          <label>New teams joining at once</label>
          <NumberInput value={model.teamsAdded} min={1} max={8} onChange={setTeamsAdded} />
          <div className="field__help">
            Past drafts added 1 team (NHL, NBA, MLS) or 2 teams (MLB 1997, WNBA 2026). Rules such as
            Multi-Team Format apply only with 2 or more.
          </div>
        </div>

        {model.modules.length === 0 ? (
          <div className="builder__empty">
            <strong>This model has no rules.</strong>
            Add rules from the list on the left, or load a past draft. The rulebook on the right updates
            as you change the rules.
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
