import type { ReactNode } from 'react'

export function Field({ label, help, tag, children }: { label: string; help?: string; tag?: 'charter' | 'code'; children: ReactNode }) {
  return (
    <div className="field">
      <label>
        {label}
        {tag && (
          <span className="law-tag" data-tag={tag} title={tag === 'charter' ? 'The Portland charter sets this rule. Changing it takes a public vote.' : 'City Code 2.08.030 sets this rule. The Council can change it by ordinance.'}>
            {tag}
          </span>
        )}
      </label>
      {children}
      {help && <div className="field__help">{help}</div>}
    </div>
  )
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" data-active={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Range({ value, min, max, step, show, onChange }: { value: number; min: number; max: number; step: number; show: string; onChange: (v: number) => void }) {
  return (
    <div className="field__row">
      <input className="range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="range-val mono">{show}</span>
    </div>
  )
}

export const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`
export const num = (x: number) => (Math.abs(x - Math.round(x)) < 1e-6 ? Math.round(x).toLocaleString() : x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
