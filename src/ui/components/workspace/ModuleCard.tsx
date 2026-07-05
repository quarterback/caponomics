import { useState } from 'react'
import type { ParamField } from '../../../engine/module'
import type { ModuleInstance } from '../../../engine/types'
import { catColor } from '../catColor'
import { Toggle } from '../primitives'
import { ParamForm } from './ParamForm'

/** The subset of a module definition the card needs — satisfied by both
 *  CapModuleDef and ExpansionModuleDef, so one card serves both tabs. */
export interface CardDef {
  label: string
  blurb: string
  category: string
  paramSchema: ParamField[]
}

export interface CardActions {
  toggle: (instanceId: string) => void
  remove: (instanceId: string) => void
  move: (instanceId: string, dir: -1 | 1) => void
  updateParam: (instanceId: string, key: string, value: unknown) => void
}

export function ModuleCard({
  def,
  instance,
  index,
  count,
  actions,
}: {
  def: CardDef
  instance: ModuleInstance
  index: number
  count: number
  actions: CardActions
}) {
  const [open, setOpen] = useState(false)

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
          <button className="btn--icon" title="Move up" disabled={index === 0} onClick={() => actions.move(instance.id, -1)}>
            ↑
          </button>
          <button className="btn--icon" title="Move down" disabled={index === count - 1} onClick={() => actions.move(instance.id, 1)}>
            ↓
          </button>
          <button className="btn--icon" title="Remove" onClick={() => actions.remove(instance.id)}>
            ✕
          </button>
          <Toggle on={instance.enabled} onChange={() => actions.toggle(instance.id)} label={`Enable ${def.label}`} />
        </div>
      </div>
      {open && (
        <div className="module__body">
          <ParamForm
            schema={def.paramSchema}
            params={instance.params}
            onChange={(key, value) => actions.updateParam(instance.id, key, value)}
          />
        </div>
      )}
    </div>
  )
}
