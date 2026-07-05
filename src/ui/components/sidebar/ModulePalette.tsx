import { MODULE_CATALOG } from '../../../engine/catalog'
import type { ModuleCategory } from '../../../engine/module'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'

const CATEGORY_ORDER: ModuleCategory[] = ['revenue', 'cap', 'floor', 'tax', 'apron', 'contract', 'roster', 'penalty', 'misc']
const CATEGORY_LABEL: Record<ModuleCategory, string> = {
  revenue: 'Revenue',
  cap: 'Cap',
  floor: 'Floor',
  tax: 'Tax',
  apron: 'Apron',
  contract: 'Contract rules',
  roster: 'Roster',
  penalty: 'Penalties',
  misc: 'Other',
}

export function ModulePalette() {
  const addModule = useStore((s) => s.addModule)

  return (
    <div className="rail__group">
      <div className="rail__label">Add a mechanic</div>
      {CATEGORY_ORDER.map((cat) => {
        const mods = MODULE_CATALOG.filter((m) => m.category === cat)
        if (!mods.length) return null
        return (
          <div className="palette__cat" key={cat}>
            <h4>{CATEGORY_LABEL[cat]}</h4>
            {mods.map((m) => (
              <button key={m.kind} className="palette__item" title={m.blurb} onClick={() => addModule(m.kind)}>
                <span className="cat-dot" style={{ background: catColor(m.category) }} />
                {m.label}
                <span className="plus">+</span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
