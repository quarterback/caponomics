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
        <span className="card__title">Ruleset</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
          {ruleset.modules.filter((m) => m.enabled).length} active · {ruleset.modules.length} total
        </span>
      </div>
      <div className="card__body">
        {ruleset.modules.length === 0 ? (
          <div className="builder__empty">
            <strong>An empty cap system.</strong>
            Add mechanics from the palette on the left — or keep it blank and just read the cap sheet.
            Every roster still produces a cap sheet with no rules at all.
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
