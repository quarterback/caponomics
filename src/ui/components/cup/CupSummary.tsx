import { cupAccessList, summarizeCup } from '../../../engine/cup/summary'
import type { CupModel } from '../../../engine/cup/types'
import { CUP_PRESETS, CUP_PRESET_MAP } from '../../../presets/cup'
import { useCup } from '../../state/cupStore'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'

const LIMIT = 'The tool has no schedules or results, so it cannot say which teams would advance or win.'

function Numbers({ model, teams }: { model: CupModel; teams: number }) {
  const { stats } = summarizeCup(model, teams)
  return (
    <dl className="statrows">
      {stats.map((s) => (
        <div className="statrow" key={s.label}>
          <dt>{s.label}</dt>
          <dd className="mono">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Rulebook({ model, teams }: { model: CupModel; teams: number }) {
  const { sections } = summarizeCup(model, teams)
  if (!sections.length) {
    return (
      <div className="builder__empty">
        <strong>No rules yet.</strong>
        Each rule you add appears here as a sentence.
      </div>
    )
  }
  return (
    <div className="rulebook">
      {sections.map((sec) => (
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
      {model.meta?.notes && <p className="field__help">{model.meta.notes}</p>}
    </div>
  )
}

function AccessList({ model }: { model: CupModel }) {
  const rows = cupAccessList(model)
  if (!rows) return null
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Access List</span>
      </div>
      <div className="access-wrap">
        <table className="access">
          <thead>
            <tr>
              <th>Rank</th>
              <th data-align="l">Association</th>
              <th>Coefficient</th>
              <th>Top</th>
              <th>Second</th>
              <th>Third</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="mono">{r.rank}</td>
                <td data-align="l">{r.name}</td>
                <td className="mono">{r.coefficient.toFixed(1)}</td>
                <td className="mono">{r.top || ''}</td>
                <td className="mono">{r.second || ''}</td>
                <td className="mono">{r.third || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** The cup tab's right panel: arithmetic from the team count, and the model
 *  written out as a rulebook, optionally beside a preset. */
export function CupSummary() {
  const { model, compareId, setCompareId } = useCup()
  const teams = useStore((s) => s.league.teams.length)
  const other = compareId ? CUP_PRESET_MAP[compareId] : undefined

  const selector = (
    <select className="cur-select" value={compareId ?? ''} onChange={(e) => setCompareId(e.target.value || null)} aria-label="Compare with a cup format">
      <option value="">Compare with…</option>
      {CUP_PRESETS.filter((p) => p.modules.length > 0).map((p) => (
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
            <span className="card__title">Comparison</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              {selector}
              <button className="btn--icon" aria-label="Close comparison" onClick={() => setCompareId(null)}>
                ✕
              </button>
            </span>
          </div>
          <div className="card__body">
            <div className="compare">
              <div className="compare__col">
                <h3>{model.name}</h3>
                <Numbers model={model} teams={teams} />
                <Rulebook model={model} teams={teams} />
              </div>
              <div className="compare__col">
                <h3>{other.name}</h3>
                <Numbers model={other} teams={teams} />
                <Rulebook model={other} teams={teams} />
              </div>
            </div>
            <div className="field__help" style={{ marginTop: 'var(--s3)' }}>
              Both columns use the loaded league’s {teams} teams. {LIMIT}
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
          <span className="card__title">Components</span>
        </div>
        <div className="card__body">
          <Numbers model={model} teams={teams} />
        </div>
      </div>
      <AccessList model={model} />
      <div className="card">
        <div className="card__head">
          <span className="card__title">Rulebook</span>
          <span style={{ marginLeft: 'auto' }}>{selector}</span>
        </div>
        <div className="card__body">
          <Rulebook model={model} teams={teams} />
          <div className="field__help" style={{ marginTop: 'var(--s3)' }}>
            {LIMIT}
          </div>
        </div>
      </div>
    </div>
  )
}
