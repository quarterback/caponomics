import { useMemo, useState } from 'react'
import { runCount } from '../../engine/count'
import { computeMetrics } from '../../engine/metrics'
import { PORTLAND, SYSTEMS, charterFit } from '../../engine/systems'
import type { CountResult, Profile, Winner } from '../../engine/types'
import { useStore } from '../store'
import { num, pct } from './bits'

const HOW: Record<Winner['how'], string> = {
  quota: 'reached threshold',
  remaining: 'won below threshold',
  finisher: 'separate count',
  committee: 'most-supported group',
  plurality: 'most first choices',
}

export function Results() {
  const { system, profile, seats, loadSystem, forked } = useStore()
  const result = useMemo(() => runCount(profile, system, seats), [profile, system, seats])
  const metrics = useMemo(() => computeMetrics(profile, result), [profile, result])
  const fit = charterFit(system)
  const name = (id: string) => profile.candidates.find((c) => c.id === id)?.name ?? id
  const campOf = campIndex(profile)
  const baseline = useMemo(() => runCount(profile, PORTLAND, seats), [profile, seats])
  const baseSet = new Set(baseline.winners.map((w) => w.id))
  const sameAsPortland = result.winners.every((w) => baseSet.has(w.id))

  return (
    <section className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">Results</span>
        </div>
        <div className="card__body stack">
          <ol className="winlist">
            {result.winners.map((w, i) => (
              <li key={w.id} data-how={w.how} data-new={!baseSet.has(w.id)}>
                <span className="mono winlist__n">{i + 1}</span>
                <strong>
                  <CampDot i={campOf.get(w.id)} />
                  {name(w.id)}
                </strong>
                <span className="winlist__how">{HOW[w.how]}</span>
                <span className="mono winlist__v">{num(w.tally)}</span>
              </li>
            ))}
          </ol>
          {system.id !== 'portland' || forked ? (
            <p className="delta" data-same={sameAsPortland}>
              {sameAsPortland
                ? 'Same winners as Portland’s current count on these ballots.'
                : `Portland’s current count elects ${baseline.winners.map((w) => name(w.id)).join(', ')} on these ballots.`}
            </p>
          ) : null}

          <dl className="readouts">
            {result.quota !== null && system.method !== 'mcpc' && (
              <Readout label="Threshold" value={num(result.quota)} note={`${pct(result.quota / result.total)} of ${num(result.total)} ballots`} />
            )}
            <Readout
              label="Least-supported winner"
              value={pct(metrics.minMandate)}
              note={metrics.weakest ? `of voters ranked ${name(metrics.weakest)} in their top 3` : ''}
              tone={metrics.minMandate < 0.25 ? 'warn' : undefined}
            />
            <Readout label="Voters who ranked a winner" value={pct(metrics.represented)} note="anywhere on their ballot" />
            <Readout label="Voters whose first choice won" value={pct(metrics.firstChoiceWon)} />
            <Readout
              label="Votes that ran out"
              value={pct(metrics.inactive)}
              note={result.lost / result.total > 0.002 ? `includes ${num(result.lost)} votes discarded by rule` : 'ballots with no choices left'}
              tone={metrics.inactive > 0.2 ? 'warn' : undefined}
            />
            <Readout
              label="Seated below the threshold"
              value={String(metrics.belowQuota.length)}
              note={metrics.belowQuota.map(name).join(', ')}
              tone={metrics.belowQuota.length ? 'warn' : undefined}
            />
            <Readout
              label="Losers preferred to a winner"
              value={String(metrics.upsets.length)}
              note={
                metrics.upsets[0]
                  ? `${name(metrics.upsets[0].loser)} beats ${name(metrics.upsets[0].winner)} ${num(metrics.upsets[0].forLoser)}–${num(metrics.upsets[0].forWinner)} head-to-head`
                  : ''
              }
            />
          </dl>

          {metrics.camps.length > 0 && (
            <div className="camps-read">
              {metrics.camps.map((c) => (
                <div className="camp-row" key={c.camp}>
                  <span className="camp-row__name">
                    <i className="swatch" />
                    {c.camp}
                  </span>
                  <div className="camp-row__bars">
                    <div className="bar" style={{ width: `${c.voteShare * 100}%` }} data-kind="votes" />
                    <div className="bar" style={{ width: `${(c.seats / seats) * 100}%` }} data-kind="seats" />
                  </div>
                  <span className="camp-row__val">
                    {pct(c.voteShare, 0)} of first choices, {c.seats} of {seats} seats
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.notes.map((n) => (
            <p className="note" key={n}>
              {n}
            </p>
          ))}

          <div className="fit" data-level={fit.level}>
            <h4>Portland Law</h4>
            <strong>{fit.label}</strong>
            <ul>
              {fit.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Compare key={profile.id} profile={profile} seats={seats} baseline={baseline} currentId={forked ? '' : system.id} onPick={loadSystem} />
      <RoundTable profile={profile} result={result} />
      <SupportTable profile={profile} result={result} support={metrics.support} />
    </section>
  )
}

/** Candidate id → index of its camp (0, 1, 2…), for the camp colour. */
function campIndex(profile: Profile): Map<string, number> {
  const camps = [...new Set(profile.candidates.map((c) => c.camp).filter(Boolean))]
  return new Map(profile.candidates.filter((c) => c.camp).map((c) => [c.id, camps.indexOf(c.camp)]))
}

function CampDot({ i }: { i: number | undefined }) {
  return i === undefined ? null : <i className="swatch" data-camp={Math.min(i, 3)} />
}

function Readout({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: 'warn' }) {
  return (
    <div className="readout">
      <dt>{label}</dt>
      <dd className="mono" data-tone={tone}>
        {value}
      </dd>
      <dd className="readout__note">{note}</dd>
    </div>
  )
}

function Compare({
  profile,
  seats,
  baseline,
  currentId,
  onPick,
}: {
  profile: Profile
  seats: number
  baseline: CountResult
  currentId: string
  onPick: (s: (typeof SYSTEMS)[number]) => void
}) {
  // Twelve counts of a real district take several seconds, so they wait for a click.
  const [asked, setAsked] = useState(false)
  const ready = !profile.real || asked
  const rows = useMemo(
    () =>
      ready
        ? SYSTEMS.map((s) => {
            const r = runCount(profile, s, seats)
            return { s, r, m: computeMetrics(profile, r), fit: charterFit(s) }
          })
        : [],
    [profile, seats, ready],
  )
  const base = new Set(baseline.winners.map((w) => w.id))
  if (!ready) {
    return (
      <div className="card">
        <div className="card__head">
          <span className="card__title">All Systems</span>
        </div>
        <div className="card__body stack">
          <p className="note">Counting these ballots under all twelve systems takes several seconds.</p>
          <button className="btn btn--primary" style={{ justifySelf: 'start' }} onClick={() => setAsked(true)}>
            Count all systems
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">All Systems</span>
      </div>
      <div className="btable-wrap flush">
        <table className="btable cmp">
          <thead>
            <tr>
              <th data-align="l">System</th>
              <th data-align="l">Winners</th>
              <th>Least-supported winner</th>
              <th>Ranked a winner</th>
              <th>Ran out</th>
              <th data-align="l">Law change needed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, r, m, fit }) => (
              <tr key={s.id} data-current={s.id === currentId} onClick={() => onPick(s)}>
                <td data-align="l">
                  <strong>{s.name}</strong>
                </td>
                <td data-align="l">
                  {r.winners.map((w) => (
                    <span key={w.id} className="wchip" data-new={!base.has(w.id)} data-weak={w.how === 'remaining'} title={HOW[w.how]}>
                      {w.id}
                    </span>
                  ))}
                </td>
                <td className="mono">{pct(m.minMandate)}</td>
                <td className="mono">{pct(m.represented)}</td>
                <td className="mono">{pct(m.inactive)}</td>
                <td data-align="l">
                  <span className="fit-chip" data-level={fit.level} title={fit.label}>
                    {fit.short}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span className="wchip" data-new="true">
          X
        </span>
        not elected under Portland’s count
        <span className="wchip" data-weak="true">
          X
        </span>
        seated below the threshold
      </div>
    </div>
  )
}

function RoundTable({ profile, result }: { profile: Profile; result: CountResult }) {
  const rounds = result.rounds
  const campOf = campIndex(profile)
  const won = new Map(result.winners.map((w, i) => [w.id, i]))
  const first = rounds[0]?.tallies ?? {}
  const outAt = new Map<string, number>()
  rounds.forEach((r, i) => r.eliminated.forEach((c) => outAt.has(c) || outAt.set(c, i)))
  // Winners first (in order elected), then by how long they survived.
  const order = [...profile.candidates].sort((a, b) => {
    const wa = won.get(a.id) ?? 99
    const wb = won.get(b.id) ?? 99
    if (wa !== wb) return wa - wb
    return (outAt.get(b.id) ?? 999) - (outAt.get(a.id) ?? 999) || (first[b.id] ?? 0) - (first[a.id] ?? 0)
  })
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Rounds</span>
      </div>
      <div className="btable-wrap flush">
        <table className="btable rounds">
          <thead>
            <tr>
              <th data-align="l">Candidate</th>
              {rounds.map((r) => (
                <th key={r.n} title={r.phase}>
                  R{r.n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.map((c) => (
              <tr key={c.id}>
                <td data-align="l" data-won={won.has(c.id)}>
                  <CampDot i={campOf.get(c.id)} />
                  {c.name}
                </td>
                {rounds.map((r) => {
                  const v = r.tallies[c.id]
                  const el = r.elected.includes(c.id)
                  const out = r.eliminated.includes(c.id)
                  const gone = v === undefined || (r.status[c.id] === 'eliminated' && !out)
                  return (
                    <td key={r.n} className="mono" data-el={el} data-out={out} data-held={!el && r.status[c.id] === 'elected'}>
                      {gone ? '' : num(v)}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr className="rounds__foot">
              <td data-align="l">No rankings left</td>
              {rounds.map((r) => (
                <td key={r.n} className="mono">
                  {r.exhausted > 0.005 ? num(r.exhausted) : ''}
                </td>
              ))}
            </tr>
            {result.lost / result.total > 0.002 && (
              <tr className="rounds__foot">
                <td data-align="l">Discarded by rule</td>
                {rounds.map((r) => (
                  <td key={r.n} className="mono">
                    {r.lost > 0.005 ? num(r.lost) : ''}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ol className="steps">
        {rounds.map((r, i) => (
          <li key={r.n}>
            <span className="mono steps__n">R{r.n}</span>
            <span>
              {(i === 0 || rounds[i - 1]!.phase !== r.phase) && r.phase !== 'STV count' && <em>{r.phase}. </em>}
              {r.note}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function SupportTable({
  profile,
  result,
  support,
}: {
  profile: Profile
  result: CountResult
  support: { id: string; first: number; top3: number; any: number }[]
}) {
  const won = new Set(result.winners.map((w) => w.id))
  const rows = [...support].sort((a, b) => b.top3 - a.top3)
  const name = (id: string) => profile.candidates.find((c) => c.id === id)?.name ?? id
  const campOf = campIndex(profile)
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Support</span>
      </div>
      <div className="btable-wrap flush">
        <table className="btable">
          <thead>
            <tr>
              <th data-align="l">Candidate</th>
              <th>First choice</th>
              <th>Top three</th>
              <th>Anywhere</th>
              <th data-align="l" style={{ width: '34%' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td data-align="l" data-won={won.has(s.id)}>
                  <CampDot i={campOf.get(s.id)} />
                  {name(s.id)}
                </td>
                <td className="mono">{pct(s.first)}</td>
                <td className="mono">{pct(s.top3)}</td>
                <td className="mono">{pct(s.any)}</td>
                <td data-align="l">
                  <div className="spark">
                    <div className="spark__any" style={{ width: `${s.any * 100}%` }} />
                    <div className="spark__top" style={{ width: `${s.top3 * 100}%` }} />
                    <div className="spark__first" style={{ width: `${s.first * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
