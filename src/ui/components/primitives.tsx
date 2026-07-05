import { useEffect, useState } from 'react'
import { fmtMoney, parseMoney } from '../../engine/format'

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          data-active={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      className="switch"
      data-on={on}
      aria-pressed={on}
      aria-label={label ?? 'toggle'}
      onClick={() => onChange(!on)}
    />
  )
}

export function Chips({
  value,
  options,
  onChange,
}: {
  value: string[]
  options: { value: string; label: string }[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  if (!options.length) return <div className="empty-note">No options for the current roster.</div>
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o.value} className="chip" data-on={value.includes(o.value)} onClick={() => toggle(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Money input that accepts shorthand (240M, 1.5m, 68000000) and echoes the
 *  parsed value. Commits on blur / Enter so typing isn't fought by re-render. */
export function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const commit = () => {
    const parsed = parseMoney(text)
    if (parsed !== null) onChange(parsed)
    else setText(String(value))
  }
  return (
    <div className="field__row">
      <input
        className="input mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        spellCheck={false}
      />
      <span className="input__echo mono">{fmtMoney(parseMoney(text) ?? value)}</span>
    </div>
  )
}

export function RangeInput({
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="field__row">
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="range-val mono">
        {value}
        {suffix ?? ''}
      </span>
    </div>
  )
}

export function NumberInput({ value, min, max, onChange }: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <input
      className="input mono"
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ maxWidth: 140 }}
    />
  )
}
