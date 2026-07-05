import type { ParamField } from '../../../engine/module'
import { useStore } from '../../state/store'
import { Chips, MoneyInput, NumberInput, RangeInput, Segmented, Toggle } from '../primitives'

interface Props {
  schema: ParamField[]
  params: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export function ParamForm({ schema, params, onChange }: Props) {
  return (
    <>
      {schema.map((field) => (
        <div className="field" key={field.key}>
          <label>{field.label}</label>
          <FieldControl field={field} value={params[field.key]} onChange={(v) => onChange(field.key, v)} />
          {field.help && <div className="field__help">{field.help}</div>}
        </div>
      ))}
    </>
  )
}

function FieldControl({ field, value, onChange }: { field: ParamField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case 'text':
      return (
        <input
          className="input"
          value={typeof value === 'string' ? value : field.default}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'money':
      return <MoneyInput value={typeof value === 'number' ? value : field.default} onChange={onChange} />
    case 'percent':
      return (
        <RangeInput
          value={typeof value === 'number' ? value : field.default}
          min={field.min ?? 0}
          max={field.max ?? 100}
          suffix="%"
          onChange={onChange}
        />
      )
    case 'number':
      return (
        <NumberInput
          value={typeof value === 'number' ? value : field.default}
          min={field.min}
          max={field.max}
          onChange={onChange}
        />
      )
    case 'boolean':
      return <Toggle on={value === true} onChange={onChange} label={field.label} />
    case 'enum':
      return (
        <Segmented
          value={typeof value === 'string' ? value : field.default}
          options={field.options}
          onChange={onChange}
        />
      )
    case 'enumMulti':
      return <EnumMulti field={field} value={value} onChange={onChange} />
    case 'bracketList':
      return <BracketList field={field} value={value} onChange={onChange} />
  }
}

/** enumMulti, with a special case: `designatedPlayerIds` pulls its options from
 *  the currently loaded roster so you can pick real players. */
function EnumMulti({ field, value, onChange }: { field: Extract<ParamField, { type: 'enumMulti' }>; value: unknown; onChange: (v: unknown) => void }) {
  const league = useStore((s) => s.league)
  const selected = Array.isArray(value) ? (value as string[]) : field.default
  let options = field.options
  if (field.key === 'designatedPlayerIds') {
    options = Object.values(league.players)
      .filter((p) => p.pos !== 'R')
      .map((p) => ({ value: p.id, label: p.name }))
  }
  return <Chips value={selected} options={options} onChange={onChange} />
}

function BracketList({ field, value, onChange }: { field: Extract<ParamField, { type: 'bracketList' }>; value: unknown; onChange: (v: unknown) => void }) {
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : (field.default as Record<string, unknown>[])
  const update = (i: number, key: string, v: unknown) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r))
    onChange(next)
  }
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  const add = () => {
    const blank: Record<string, unknown> = {}
    for (const f of field.itemSchema) blank[f.key] = 'default' in f ? f.default : undefined
    onChange([...rows, blank])
  }
  return (
    <div className="brackets">
      {rows.map((row, i) => (
        <div className="bracket-row" key={i}>
          {field.itemSchema.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <FieldControl field={f} value={row[f.key]} onChange={(v) => update(i, f.key, v)} />
            </div>
          ))}
          <button className="btn--icon" title="Remove" onClick={() => remove(i)}>
            ✕
          </button>
        </div>
      ))}
      <button className="btn btn--sm" onClick={add}>
        + Add row
      </button>
    </div>
  )
}
