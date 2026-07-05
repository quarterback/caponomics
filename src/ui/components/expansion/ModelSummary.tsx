import { summarizeModel } from '../../../engine/expansion/summary'
import type { ExpansionModel } from '../../../engine/expansion/types'
import { EXPANSION_PRESETS, EXPANSION_PRESET_MAP } from '../../../presets/expansion'
import { useExpansion } from '../../state/expansionStore'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'

const DISCLAIMER =
  'A calculator, not a prescription: this describes the redistribution rules you designed. It ' +
  "doesn't judge them — and deliberately doesn't simulate who would get picked."

function Tiles({ model, existingTeams }: { model: ExpansionModel; existingTeams: number }) {
  const summary = summarizeModel(model, existingTeams)
  return (
    <div className="tiles">
      {summary.stats.map((s) => (
        <div className="tile" key={s.label}>
          <div className="tile__label">{s.label}</div>
          <div className="tile__value mono">{s.value}</div>
        </div>
      ))}
    </div>
  )
}

function Rulebook({ model, existingTeams }: { model: ExpansionModel; existingTeams: number }) {
  const summary = summarizeModel(model, existingTeams)
  if (summary.sections.length === 0) {
    return (
      <div className="builder__empty">
        <strong>No rules yet.</strong>
        Whatever you stack on the left reads back here as a plain-language rulebook.
      </div>
    )
  }
  return (
    <div className="rulebook">
      {summary.sections.map((sec) => (
        <div className="rulebook__section" key={sec.category}>
          <h4>
            <span className="cat-dot" style={{ background: catColor(sec.category) }} />
            {sec.title}
          </h4>
          <ul>
            {sec.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** The expansion tab's right panel: roster-free "at a glance" stats plus the
 *  model rendered as a plain-language rulebook — optionally side-by-side with
 *  any preset, for old-vs-new comparisons. No picks, no winners — the rules
 *  ARE the output. */
export function ModelSummary() {
  const model = useExpansion((s) => s.model)
  const compareId = useExpansion((s) => s.compareId)
  const setCompareId = useExpansion((s) => s.setCompareId)
  const league = useStore((s) => s.league)
  const teams = league.teams.length
  const other = compareId ? EXPANSION_PRESET_MAP[compareId] : undefined

  const selector = (
    <select
      className="cur-select mono"
      value={compareId ?? ''}
      onChange={(e) => setCompareId(e.target.value || null)}
      title="Show a preset model side by side with yours"
    >
      <option value="">Compare with…</option>
      {EXPANSION_PRESETS.filter((p) => p.modules.length > 0).map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  )

  if (other) {
    return (
      <div className="col">
        <div className="card">
          <div className="card__head">
            <span className="card__title">Side by side</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              {selector}
              <button className="btn--icon" title="Close comparison" onClick={() => setCompareId(null)}>
                ✕
              </button>
            </span>
          </div>
          <div className="card__body">
            <div className="compare">
              <div className="compare__col">
                <h3>
                  {model.name} <small>(editing)</small>
                </h3>
                <Tiles model={model} existingTeams={teams} />
                <Rulebook model={model} existingTeams={teams} />
              </div>
              <div className="compare__col">
                <h3>
                  {other.name} <small>(preset)</small>
                </h3>
                <Tiles model={other} existingTeams={teams} />
                <Rulebook model={other} existingTeams={teams} />
              </div>
            </div>
            <div className="field__help" style={{ marginTop: 'var(--s3)' }}>
              {DISCLAIMER} Quick math for both columns uses the loaded league ({teams} existing teams).
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">At a glance</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
            vs {league.name}
          </span>
        </div>
        <div className="card__body">
          <Tiles model={model} existingTeams={teams} />
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">The rulebook</span>
          <span style={{ marginLeft: 'auto' }}>{selector}</span>
        </div>
        <div className="card__body">
          <Rulebook model={model} existingTeams={teams} />
          <div className="field__help" style={{ marginTop: 'var(--s3)' }}>{DISCLAIMER}</div>
        </div>
      </div>
    </div>
  )
}
