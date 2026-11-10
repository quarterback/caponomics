import { useStore } from '../store'
import { Field, Range, Seg, pct } from './bits'

export function Rules() {
  const { system: s, patchSystem: set, seats, profile } = useStore()
  const hasScores = profile.ballots.some((b) => b.scores)
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Rules</span>
      </div>
      <div className="card__body form">
        <Field label="Counting method">
          <Seg
            value={s.method}
            onChange={(v) => set({ method: v })}
            options={[
              { value: 'stv', label: 'Round-by-round STV' },
              { value: 'meek', label: 'Meek / Warren' },
              { value: 'mcpc', label: 'Most-supported group (MCPC)' },
              { value: 'sntv', label: 'First choices only' },
              { value: 'trv', label: 'Score ballots (TRV)' },
            ]}
          />
        </Field>

        {s.method === 'stv' && (
          <>
            <Field
              label="Threshold to win a seat"
              tag="charter"
              help={
                s.quota === 'custom'
                  ? 'You set the share of all ballots a candidate needs. Each voter has one vote, so three winners can each hold one-third at most. If you set a higher share, the rule for leftover seats fills some seats.'
                  : s.quota === 'droop'
                    ? 'Divide the ballots by the number of seats plus one, drop any fraction, and add one. For three seats, a candidate needs just over 25%.'
                    : s.quota === 'hare'
                      ? 'Divide the ballots by the number of seats. For three seats, a candidate needs one-third.'
                      : 'Divide the ballots by the number of seats plus one. The result is not rounded.'
              }
            >
              <Seg
                value={s.quota}
                onChange={(v) => set({ quota: v })}
                options={[
                  { value: 'droop', label: 'Droop (Portland)' },
                  { value: 'exact', label: 'Exact Droop' },
                  { value: 'hare', label: 'Hare' },
                  { value: 'custom', label: 'Set a share' },
                ]}
              />
              {s.quota === 'custom' && <Range value={s.quotaShare} min={0.15} max={0.5} step={0.005} show={pct(s.quotaShare)} onChange={(v) => set({ quotaShare: v })} />}
            </Field>

            <Field
              label="What happens to a winner’s extra votes"
              tag="code"
              help={
                s.surplus === 'wigm'
                  ? 'A winner’s extra votes move to the next choice on every ballot the winner holds. Each ballot moves at a fraction of its value. Portland uses this method.'
                  : s.surplus === 'last-parcel'
                    ? 'Only the last group of ballots the winner received moves on. Earlier ballots stay with the winner.'
                    : 'A winner keeps all their votes. Votes above the threshold help no other candidate.'
              }
            >
              <Seg
                value={s.surplus}
                onChange={(v) => set({ surplus: v })}
                options={[
                  { value: 'wigm', label: 'All ballots move' },
                  { value: 'last-parcel', label: 'Last group moves' },
                  { value: 'none', label: 'None move' },
                ]}
              />
            </Field>
            {s.surplus !== 'none' && (
              <div className="pair">
                <Field label="When several candidates win at once" tag="code">
                  <Seg
                    value={s.surplusOrder}
                    onChange={(v) => set({ surplusOrder: v })}
                    options={[
                      { value: 'simultaneous', label: 'Move all extras together' },
                      { value: 'largest', label: 'Largest extra first' },
                    ]}
                  />
                </Field>
                <Field label="Rounding" tag="code">
                  <Seg
                    value={s.truncate ? 't' : 'e'}
                    onChange={(v) => set({ truncate: v === 't' })}
                    options={[
                      { value: 't', label: 'Cut at 4 decimals' },
                      { value: 'e', label: 'No rounding' },
                    ]}
                  />
                </Field>
              </div>
            )}

            <Field
              label="Who is eliminated"
              tag="charter"
              help={
                s.elimination === 'lowest'
                  ? 'The count removes the candidate with the fewest votes.'
                  : s.elimination === 'btr'
                    ? 'The count compares the two lowest candidates on every ballot still counting. It removes the one fewer voters prefer.'
                    : 'The count scores each candidate by how high voters rank them. It removes the candidate with the lowest score.'
              }
            >
              <Seg
                value={s.elimination}
                onChange={(v) => set({ elimination: v })}
                options={[
                  { value: 'lowest', label: 'Fewest votes' },
                  { value: 'btr', label: 'Bottom-two runoff' },
                  { value: 'borda', label: 'Lowest ranking score' },
                ]}
              />
            </Field>

            <Field
              label="What a ballot is worth after its candidate is removed"
              tag="charter"
              help={s.decay < 1 ? `The ballot moves to its next choice at ${pct(s.decay, 0)} of its value. The rest is discarded.` : 'The ballot moves to its next choice at full value.'}
            >
              <Range value={s.decay} min={0.5} max={1} step={0.05} show={pct(s.decay, 0)} onChange={(v) => set({ decay: v })} />
            </Field>

            <Field
              label="When as many candidates remain as open seats"
              tag="charter"
              help={
                s.completion === 'elect-remaining'
                  ? 'The remaining candidates win, even below the threshold.'
                  : 'No one wins below the threshold. A separate count fills the open seats, with every ballot at full value.'
              }
            >
              <Seg
                value={s.completion}
                onChange={(v) => set({ completion: v })}
                options={[
                  { value: 'elect-remaining', label: 'Remaining candidates win' },
                  { value: 'finisher', label: 'Hold a separate count' },
                ]}
              />
            </Field>

            <Field
              label="Seats filled by a separate districtwide count"
              tag="charter"
              help={
                s.resetSeats === 0
                  ? 'The STV count fills every seat.'
                  : Math.min(s.resetSeats, seats) >= seats
                    ? 'Each seat gets its own count, with every ballot at full value. A majority of voters can win every seat.'
                    : `The STV count fills ${seats - Math.min(s.resetSeats, seats)} of ${seats} seats. A separate count fills the rest, with every ballot at full value.`
              }
            >
              <Range value={Math.min(s.resetSeats, seats)} min={0} max={seats} step={1} show={String(Math.min(s.resetSeats, seats))} onChange={(v) => set({ resetSeats: v })} />
            </Field>
            {(s.resetSeats > 0 || s.completion === 'finisher') && (
              <div className="pair">
                <Field label="How the separate count picks a winner">
                  <Seg
                    value={s.finisher}
                    onChange={(v) => set({ finisher: v })}
                    options={[
                      { value: 'condorcet', label: 'Beats every rival' },
                      { value: 'irv', label: 'Instant runoff' },
                    ]}
                  />
                </Field>
                {s.resetSeats > 0 && s.resetSeats < seats && (
                  <Field label="Seats used to set the threshold">
                    <Seg
                      value={s.quotaBasis}
                      onChange={(v) => set({ quotaBasis: v })}
                      options={[
                        { value: 'all', label: 'All seats' },
                        { value: 'stv', label: 'STV seats only' },
                      ]}
                    />
                  </Field>
                )}
              </div>
            )}
          </>
        )}

        {s.method === 'meek' && (
          <Field
            label="How winners share ballots"
            help={
              s.meekVariant === 'meek'
                ? 'Each winner keeps the same share of every ballot that reaches them. The rest moves to the voter’s next choice. The threshold falls as ballots run out of choices.'
                : 'Each winner takes the same amount from every ballot that reaches them, up to what the ballot has left.'
            }
          >
            <Seg
              value={s.meekVariant}
              onChange={(v) => set({ meekVariant: v })}
              options={[
                { value: 'meek', label: 'Meek: same share' },
                { value: 'warren', label: 'Warren: same amount' },
              ]}
            />
          </Field>
        )}

        {s.method === 'mcpc' && (
          <>
            <Field label="How many top choices count as support" help="A voter supports every candidate in their top choices, so one voter can support all the winners.">
              <Range value={s.consentDepth} min={1} max={6} step={1} show={`top ${s.consentDepth}`} onChange={(v) => set({ consentDepth: v })} />
            </Field>
            <Field
              label="Support every winner needs"
              help="Set the share of all voters who must support each winner. The tool picks the group of winners that represents the most voters. If no group meets the share, the tool lowers it to the highest share these candidates can meet, and tells you."
            >
              <Range value={s.mandate} min={0} max={0.6} step={0.01} show={pct(s.mandate, 0)} onChange={(v) => set({ mandate: v })} />
            </Field>
          </>
        )}

        {s.method === 'trv' && (
          <>
            <Field
              label="Currency per ballot"
              help={`At 1 the count is proportional: a seat costs a third of all currency, so a group needs about a third of voters to win one. At ${seats} it is plain score voting, and a majority can win every seat.`}
            >
              <Range value={Math.min(s.trvC, seats)} min={1} max={Math.max(1, seats)} step={0.05} show={Math.min(s.trvC, seats).toFixed(2)} onChange={(v) => set({ trvC: v })} />
            </Field>
            <Field
              label="Rescale each ballot"
              help={
                s.trvRescale
                  ? 'Each voter’s top score counts as 1 and lowest as 0, as in the paper. A lukewarm favourite counts as much as an enthusiastic one.'
                  : 'Scores count as marked on the 0 to 5 scale. A voter who gives no one a 5 has less influence.'
              }
            >
              <Seg
                value={s.trvRescale ? 'on' : 'off'}
                onChange={(v) => set({ trvRescale: v === 'on' })}
                options={[
                  { value: 'on', label: 'On (paper)' },
                  { value: 'off', label: 'Off' },
                ]}
              />
            </Field>
            <Field
              label="Scores for ranked ballots"
              help={
                hasScores
                  ? 'These ballots have scores, so this setting is not used.'
                  : s.rankToScore === 'points'
                    ? 'These ballots have rankings only. First choice scores 5, and each lower rank scores less.'
                    : `These ballots have rankings only. A candidate in a voter’s top ${s.consentDepth} scores 5; the rest score 0.`
              }
            >
              <Seg
                value={s.rankToScore}
                onChange={(v) => set({ rankToScore: v })}
                options={[
                  { value: 'points', label: 'Points by rank' },
                  { value: 'approval', label: 'Top choices approved' },
                ]}
              />
              {s.rankToScore === 'approval' && !hasScores && (
                <Range value={s.consentDepth} min={1} max={6} step={1} show={`top ${s.consentDepth}`} onChange={(v) => set({ consentDepth: v })} />
              )}
            </Field>
          </>
        )}

        {s.method === 'sntv' && <div className="field__help">The candidates with the most first choices win. The count ignores later choices. Use this method as a comparison.</div>}
      </div>
    </div>
  )
}
