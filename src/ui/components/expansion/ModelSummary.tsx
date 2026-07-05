import { summarizeModel } from '../../../engine/expansion/summary'
import { useExpansion } from '../../state/expansionStore'
import { useStore } from '../../state/store'
import { catColor } from '../catColor'

/** The expansion tab's right panel: roster-free "at a glance" stats plus the
 *  model rendered as a plain-language rulebook. No picks, no winners — the
 *  rules ARE the output. */
export function ModelSummary() {
  const model = useExpansion((s) => s.model)
  const league = useStore((s) => s.league)
  const summary = summarizeModel(model, league.teams.length)

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
          <div className="tiles">
            {summary.stats.map((s) => (
              <div className="tile" key={s.label}>
                <div className="tile__label">{s.label}</div>
                <div className="tile__value mono">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">The rulebook</span>
        </div>
        <div className="card__body">
          {summary.sections.length === 0 ? (
            <div className="builder__empty">
              <strong>No rules yet.</strong>
              Whatever you stack on the left reads back here as a plain-language rulebook.
            </div>
          ) : (
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
          )}
          <div className="field__help" style={{ marginTop: 'var(--s3)' }}>
            A calculator, not a prescription: this describes the redistribution rules you designed. It
            doesn't judge them — and deliberately doesn't simulate who would get picked.
          </div>
        </div>
      </div>
    </div>
  )
}
