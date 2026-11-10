import { useEffect, useState } from 'react'
import { DEFAULT_GEN, formatBallots } from '../../engine/profiles'
import { useStore } from '../store'
import { Field, Range } from './bits'

export function Contest() {
  const { profile, seats, setSeats, setGen, applyText } = useStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  useEffect(() => {
    setText(formatBallots(profile))
    setErrors([])
  }, [profile])
  const voters = profile.ballots.reduce((s, b) => s + b.n, 0)
  const g = profile.gen
  const big = profile.ballots.length > 400

  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Contest</span>
        <span className="card__meta">
          {profile.name} · {voters.toLocaleString()} ballots · {profile.candidates.length} candidates
        </span>
      </div>
      <div className="card__body form">
        <Field label="Seats to fill" help="Portland districts elect 3. Set 1 to see the single-member version of any rule.">
          <div className="stepper">
            <button className="btn btn--sm" onClick={() => setSeats(seats - 1)} aria-label="Fewer seats">
              −
            </button>
            <span className="mono stepper__val">{seats}</span>
            <button className="btn btn--sm" onClick={() => setSeats(seats + 1)} aria-label="More seats">
              +
            </button>
          </div>
        </Field>

        {g ? (
          <>
            <Field
              label="Slate cohesion"
              help="How much rankings follow camp lines. Low = free radicals ranked on personal pull; high = voters rank down their camp."
            >
              <Range value={g.cohesion} min={0} max={1} step={0.05} show={`${Math.round(g.cohesion * 100)}%`} onChange={(v) => setGen({ cohesion: v })} />
            </Field>
            <Field label="Candidates">
              <Range value={g.candidates} min={4} max={30} step={1} show={String(g.candidates)} onChange={(v) => setGen({ candidates: v })} />
            </Field>
            <Field label="Bullet voters" help="Share who rank a single candidate and stop.">
              <Range value={g.bullet} min={0} max={0.6} step={0.02} show={`${Math.round(g.bullet * 100)}%`} onChange={(v) => setGen({ bullet: v })} />
            </Field>
            <Field label="Rankings allowed" help="Portland’s ballot has six columns.">
              <Range value={g.maxRanks} min={2} max={10} step={1} show={String(g.maxRanks)} onChange={(v) => setGen({ maxRanks: v })} />
            </Field>
            <Field label="Camp sizes" help="Relative size of each camp of voters (2–4 camps).">
              <div className="camps">
                {g.camps.map((c, i) => (
                  <input
                    key={i}
                    className="input mono"
                    type="number"
                    min={1}
                    max={100}
                    value={Math.round(c * 100)}
                    onChange={(e) => {
                      const camps = [...g.camps]
                      camps[i] = Math.max(1, Number(e.target.value)) / 100
                      setGen({ camps })
                    }}
                  />
                ))}
                {g.camps.length < 4 && (
                  <button className="btn btn--sm" onClick={() => setGen({ camps: [...g.camps, 0.15] })}>
                    +
                  </button>
                )}
                {g.camps.length > 2 && (
                  <button className="btn btn--sm" onClick={() => setGen({ camps: g.camps.slice(0, -1) })}>
                    −
                  </button>
                )}
              </div>
            </Field>
            <Field label="Electorate">
              <div className="field__row">
                <button className="btn btn--sm" onClick={() => setGen({ seed: Math.floor(Math.random() * 1e6) })}>
                  Re-roll voters
                </button>
                <span className="input__echo mono">seed {g.seed}</span>
              </div>
            </Field>
          </>
        ) : (
          <button className="btn btn--sm" style={{ justifySelf: 'start' }} onClick={() => setGen(DEFAULT_GEN)}>
            Generate a synthetic district instead
          </button>
        )}

        <div>
          <button className="linkish" onClick={() => setOpen(!open)}>
            {open ? '▾' : '▸'} Edit ballots as text
          </button>
          {open && (
            <div className="ballot-edit">
              {big && <div className="field__help">{profile.ballots.length.toLocaleString()} distinct rankings — editing by hand is easier on the small sets.</div>}
              <textarea className="input mono" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} rows={10} />
              <div className="field__help">
                One line per group: <span className="mono">26: A &gt; B &gt; C</span>. Optional camp lines: <span className="mono">A [Camp name]</span>.
              </div>
              {errors.map((e) => (
                <div key={e} className="field__err">
                  {e}
                </div>
              ))}
              <button className="btn btn--sm btn--primary" style={{ justifySelf: 'start' }} onClick={() => setErrors(applyText(text))}>
                Count these ballots
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
