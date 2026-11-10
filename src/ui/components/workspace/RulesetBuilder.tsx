import { MODULE_MAP } from '../../../engine/catalog'
import { useStore } from '../../state/store'
import { ModuleCard } from './ModuleCard'

export function RulesetBuilder() {
  const ruleset = useStore((s) => s.ruleset)
  const { toggleModule, removeModule, moveModule, updateParam } = useStore()
  const actions = { toggle: toggleModule, remove: removeModule, move: moveModule, updateParam }

  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Rules</span>
      </div>
      <div className="card__body">
        {ruleset.modules.length === 0 ? (
          <div className="builder__empty">
            <strong>This cap system has no rules.</strong>
            Add mechanics from the list on the left. With no rules, each team still gets a cap sheet.
          </div>
        ) : (
          <div className="builder">
            {ruleset.modules.map((m, i) => {
              const def = MODULE_MAP[m.kind]
              if (!def) return null
              return <ModuleCard key={m.id} def={def} instance={m} index={i} count={ruleset.modules.length} actions={actions} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
