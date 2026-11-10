import { useMemo } from 'react'
import { runCount } from '../../engine/count'
import { computeMetrics } from '../../engine/metrics'
import { PORTLAND, SYSTEMS, charterFit } from '../../engine/systems'
import type { CountResult, Profile, Winner } from '../../engine/types'
import { useStore } from '../store'
import { num, pct } from './bits'

const HOW: Record<Winner['how'], string> = {
  quota: 'reached threshold',
  remaining: 'last standing',
  finisher: 'fresh count',
  committee: 'committee',
  plurality: 'first choices',
}

export function Results() {
  const { system, profile, seats, loadSystem, forked } = useStore()
  const result = useMemo(() => runCount(profile, system, seats), [profile, system, seats])
  const metrics = useMemo(() => computeMetrics(profile, result), [profile, result])
  const fit = charterFit(system)
  const name = (id: string) => profile.candidates.find((c) => c.id === id)?.name ?? id
  const baseline = useMemo(() => runCount(profile, PORTLAND, seats), [profile, seats])
  const baseSet = new Set(baseline.winners.map((w) => w.id))
  const sameAsPortland = result.winners.every((w) => baseSet.has(w.id))

  return (
    <section className="col">
      <div className="card">
        <div className="card__head">
          <span className="card__title">Who wins</span>
          <span className="card__meta">
            {result.quota !== null && system.method !== 'mcpc' && (
              <>
                threshold <span className="mono">{num(result.quota)}</span> of <span className="mono">{num(result.total)}</span> ({pct(result.quota / result.total)})
              </>
            )}
          </span>
        </div>
        <div className="card__body stack">
          <div className="winners">
            {result.winners.map((w, i) => (
              <div className="winner" key={w.id} data-how={w.how} data-new={!baseSet.has(w.id)}>
                <span className="winner__seat mono">{i + 1}</span>
                <div>
                  <strong>{name(w.id)}</strong>
                  <span>
                    {HOW[w.how]} · <span className="mono">{num(w.tally)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          {system.id !== 'portland' || forked ? (
            <div className="delta" data-same={sameAsPortland}>
              {sameAsPortland
                ? 'Same winners as Portland’s current count on these ballots.'
                : `Differs from Portland’s current count, which elects ${baseline.winners.map((w) => name(w.id)).join(', ')}.`}
            </div>
          ) : null}

          <div className="lsummary">
            <Tile
              label="Weakest mandate"
              value={pct(metrics.minMandate)}
              sub={metrics.weakest ? `${name(metrics.weakest)} — voters ranking them top 3` : ''}
              tone={metrics.minMandate < 0.25 ? 'warn' : undefined}
            />
            <Tile label="Voters with a winner" value={pct(metrics.represented)} sub="ranked at least one winner" />
            <Tile label="First choice won" value={pct(metrics.firstChoiceWon)} sub="of all voters" />
            <Tile
              label="Vote value behind no one"
              value={pct(metrics.inactive)}
              sub={result.lost / result.total > 0.002 ? `${num(result.lost)} votes destroyed by rule` : 'ran out of rankings'}
              tone={metrics.inactive > 0.2 ? 'warn' : undefined}
            />
            <Tile
              label="Seated below threshold"
              value={String(metrics.belowQuota.length)}
              sub={metrics.belowQuota.map(name).join(', ') || 'none'}
              tone={metrics.belowQuota.length ? 'warn' : 'good'}
            />
            <Tile
              label="Head-to-head upsets"
              value={String(metrics.upsets.length)}
              sub={
                metrics.upsets[0]
                  ? `${name(metrics.upsets[0].loser)} beats ${name(metrics.upsets[0].winner)} ${num(metrics.upsets[0].forLoser)}–${num(metrics.upsets[0].forWinner)}`
                  : 'no loser out-polls a winner'
              }
            />
          </div>

          {metrics.camps.length > 0 && (
            <div className="camps-read">
              {metrics.camps.map((c) => (
                <div className="camp-row" key={c.camp}>
                  <span className="camp-row__name">{c.camp}</span>
                  <div className="camp-row__bars">
                    <div className="bar" style={{ width: `${c.voteShare * 100}%` }} data-kind="votes" />
                    <div className="bar" style={{ width: `${(c.seats / seats) * 100}%` }} data-kind="seats" />
                  </div>
                  <span className="camp-row__val">
                    {pct(c.voteShare, 0)} of first choices → {c.seats} of {seats} seats
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
            <strong>{fit.label}</strong>
            <ul>
              {fit.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Compare profile={profile} seats={seats} baseline={baseline} currentId={forked ? '' : system.id} onPick={loadSystem} />
      <RoundTable profile={profile} result={result} />
      <SupportTable profile={profile} result={result} support={metrics.support} />
    </section>
  )
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <div className="tile">
      <div className="tile__label">{label}</div>
      <div className="tile__value" data-tone={tone}>
        {value}
      </div>
      {sub && <div className="tile__sub">{sub}</div>}
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
  const rows = useMemo(
    () =>
      SYSTEMS.map((s) => {
        const r = runCount(profile, s, seats)
        return { s, r, m: computeMetrics(profile, r), fit: charterFit(s) }
      }),
    [profile, seats],
  )
  const base = new Set(baseline.winners.map((w) => w.id))
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Every system, these ballots</span>
        <span className="card__meta">click a row to load it</span>
      </div>
      <div className="btable-wrap flush">
        <table className="btable cmp">
          <thead>
            <tr>
              <th data-align="l">System</th>
              <th data-align="l">Winners</th>
              <th>Weakest mandate</th>
              <th>With a winner</th>
              <th>Behind no one</th>
              <th data-align="l">Change needs</th>
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
        <span className="card__title">The count, round by round</span>
        <span className="card__meta">{rounds.length} round{rounds.length === 1 ? '' : 's'}</span>
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
              <td data-align="l">Out of rankings</td>
              {rounds.map((r) => (
                <td key={r.n} className="mono">
                  {r.exhausted > 0.005 ? num(r.exhausted) : ''}
                </td>
              ))}
            </tr>
            {result.lost / result.total > 0.002 && (
              <tr className="rounds__foot">
                <td data-align="l">Destroyed by rule</td>
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
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Breadth of support</span>
        <span className="card__meta">share of all voters ranking each candidate</span>
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
