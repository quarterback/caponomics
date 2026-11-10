import { useEffect, useState } from 'react'
import { DEFAULT_GEN, formatBallots } from '../../engine/profiles'
import { useStore } from '../store'
import { Field, Range } from './bits'

export function Contest() {
  const { profile, seats, setSeats, setGen, applyText } = useStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  // Real sets have tens of thousands of rankings, so the text is built only if asked for.
  useEffect(() => {
    setText(profile.real ? '' : formatBallots(profile))
    setErrors([])
    if (profile.real) setOpen(false)
  }, [profile])
  const g = profile.gen
  const big = profile.ballots.length > 400

  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Contest</span>
      </div>
      <div className="card__body form">
        <Field label="Seats to fill" help="Portland districts elect three. Set one seat to count a single-member district.">
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
              label="How closely voters follow a slate"
              help="At 0%, voters rank candidates one by one. At 100%, voters rank the candidates from their own camp first."
            >
              <Range value={g.cohesion} min={0} max={1} step={0.05} show={`${Math.round(g.cohesion * 100)}%`} onChange={(v) => setGen({ cohesion: v })} />
            </Field>
            <Field label="Candidates">
              <Range value={g.candidates} min={4} max={30} step={1} show={String(g.candidates)} onChange={(v) => setGen({ candidates: v })} />
            </Field>
            <Field label="Voters who rank only one candidate">
              <Range value={g.bullet} min={0} max={0.6} step={0.02} show={`${Math.round(g.bullet * 100)}%`} onChange={(v) => setGen({ bullet: v })} />
            </Field>
            <Field label="Choices a ballot allows" help="Portland’s ballot allows six.">
              <Range value={g.maxRanks} min={2} max={10} step={1} show={String(g.maxRanks)} onChange={(v) => setGen({ maxRanks: v })} />
            </Field>
            <Field label="Camp sizes" help="Enter the relative size of each camp of voters. Use two to four camps.">
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
            <Field label="Voters">
              <div className="field__row">
                <button className="btn btn--sm" onClick={() => setGen({ seed: Math.floor(Math.random() * 1e6) })}>
                  Draw new voters
                </button>
                <span className="input__echo mono">seed {g.seed}</span>
              </div>
            </Field>
          </>
        ) : (
          <button className="btn btn--sm" style={{ justifySelf: 'start' }} onClick={() => setGen(DEFAULT_GEN)}>
            Use a generated district
          </button>
        )}

        <div>
          {profile.real && <p className="field__help">{profile.blurb}</p>}
          <button
            className="linkish"
            onClick={() => {
              if (!open && profile.real && !text) setText(formatBallots(profile))
              setOpen(!open)
            }}
          >
            {open ? '▾' : '▸'} Edit ballots as text
          </button>
          {open && (
            <div className="ballot-edit">
              {big && <div className="field__help">This set has {profile.ballots.length.toLocaleString()} different rankings. The smaller sets are easier to edit by hand.</div>}
              <textarea className="input mono" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} rows={10} />
              <div className="field__help">
                Write one line for each group of identical ballots, like <span className="mono">26: A &gt; B &gt; C</span>. To put a
                candidate in a camp, add a line like <span className="mono">A [Camp name]</span>. For score ballots, write
                scores from 0 to 5, like <span className="mono">3: A=5, B=2</span>.
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
