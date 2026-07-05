import { useState } from 'react'
import { MODULE_MAP } from '../../../engine/catalog'
import type { ModuleInstance } from '../../../engine/types'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'
import { Toggle } from '../primitives'
import { ParamForm } from './ParamForm'

export function ModuleCard({ instance, index, count }: { instance: ModuleInstance; index: number; count: number }) {
  const def = MODULE_MAP[instance.kind]
  const [open, setOpen] = useState(false)
  const { toggleModule, removeModule, moveModule, updateParam } = useStore()
  if (!def) return null

  return (
    <div className="module" data-disabled={!instance.enabled}>
      <div className="module__head" onClick={() => setOpen((o) => !o)}>
        <svg className="chev" data-open={open} width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="cat-dot" style={{ background: catColor(def.category) }} />
        <div className="module__title">
          <strong>{def.label}</strong>
          <span>{def.blurb}</span>
        </div>
        <div className="module__spacer" />
        <div className="module__actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn--icon" title="Move up" disabled={index === 0} onClick={() => moveModule(instance.id, -1)}>
            ↑
          </button>
          <button className="btn--icon" title="Move down" disabled={index === count - 1} onClick={() => moveModule(instance.id, 1)}>
            ↓
          </button>
          <button className="btn--icon" title="Remove" onClick={() => removeModule(instance.id)}>
            ✕
          </button>
          <Toggle on={instance.enabled} onChange={() => toggleModule(instance.id)} label={`Enable ${def.label}`} />
        </div>
      </div>
      {open && (
        <div className="module__body">
          <ParamForm
            schema={def.paramSchema}
            params={instance.params}
            onChange={(key, value) => updateParam(instance.id, key, value)}
          />
        </div>
      )}
    </div>
  )
}
