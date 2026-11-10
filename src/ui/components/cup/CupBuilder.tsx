import { CUP_MAP } from '../../../engine/cup/catalog'
import { useCup } from '../../state/cupStore'
import { ModuleCard } from '../workspace/ModuleCard'

export function CupBuilder() {
  const { model, toggleRule, removeRule, moveRule, updateParam } = useCup()
  const actions = { toggle: toggleRule, remove: removeRule, move: moveRule, updateParam }
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Rules</span>
      </div>
      <div className="card__body">
        {model.modules.length === 0 ? (
          <div className="builder__empty">
            <strong>This cup has no rules yet.</strong>
            Add rules from the list on the left, or choose a cup format to start from.
          </div>
        ) : (
          <div className="builder">
            {model.modules.map((m, i) => {
              const def = CUP_MAP[m.kind]
              if (!def) return null
              return <ModuleCard key={m.id} def={def} instance={m} index={i} count={model.modules.length} actions={actions} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
