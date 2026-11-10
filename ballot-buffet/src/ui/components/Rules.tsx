import { useStore } from '../store'
import { Field, Range, Seg, pct } from './bits'

export function Rules() {
  const { system: s, patchSystem: set, seats } = useStore()
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">Counting rules</span>
        <span className="card__meta">every preset is just a setting of these</span>
      </div>
      <div className="card__body form">
        <Field label="Machine">
          <Seg
            value={s.method}
            onChange={(v) => set({ method: v })}
            options={[
              { value: 'stv', label: 'Round-by-round STV' },
              { value: 'meek', label: 'Meek / Warren' },
              { value: 'mcpc', label: 'Consent committee' },
              { value: 'sntv', label: 'First choices only' },
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
                  ? 'Share of all valid ballots. With one conserved vote per voter, three winners can each hold at most ⅓ — above that, seats can only be filled by the completion rule.'
                  : s.quota === 'droop'
                    ? 'votes ÷ (seats + 1), plus one, fractions dropped — 25% + 1 for three seats.'
                    : s.quota === 'hare'
                      ? 'votes ÷ seats — ⅓ for three seats. The highest bar every winner could clear at once.'
                      : 'votes ÷ (seats + 1) exactly, no rounding.'
              }
            >
              <Seg
                value={s.quota}
                onChange={(v) => set({ quota: v })}
                options={[
                  { value: 'droop', label: 'Droop' },
                  { value: 'exact', label: 'Exact Droop' },
                  { value: 'hare', label: 'Hare' },
                  { value: 'custom', label: 'Custom' },
                ]}
              />
              {s.quota === 'custom' && <Range value={s.quotaShare} min={0.15} max={0.5} step={0.005} show={pct(s.quotaShare)} onChange={(v) => set({ quotaShare: v })} />}
            </Field>

            <Field
              label="Surplus transfers"
              tag="code"
              help={
                s.surplus === 'wigm'
                  ? 'Weighted inclusive Gregory: every ballot behind the winner moves on at a fraction of its current value.'
                  : s.surplus === 'last-parcel'
                    ? 'Only the batch of ballots that pushed the winner over the line is examined.'
                    : 'Votes beyond the threshold stay with the winner and are wasted.'
              }
            >
              <Seg
                value={s.surplus}
                onChange={(v) => set({ surplus: v })}
                options={[
                  { value: 'wigm', label: 'All ballots (WIGM)' },
                  { value: 'last-parcel', label: 'Last parcel' },
                  { value: 'none', label: 'None' },
                ]}
              />
            </Field>
            {s.surplus !== 'none' && (
              <div className="pair">
                <Field label="Surplus order" tag="code">
                  <Seg
                    value={s.surplusOrder}
                    onChange={(v) => set({ surplusOrder: v })}
                    options={[
                      { value: 'simultaneous', label: 'All at once' },
                      { value: 'largest', label: 'Largest first' },
                    ]}
                  />
                </Field>
                <Field label="Arithmetic" tag="code">
                  <Seg
                    value={s.truncate ? 't' : 'e'}
                    onChange={(v) => set({ truncate: v === 't' })}
                    options={[
                      { value: 't', label: '4 decimals' },
                      { value: 'e', label: 'Exact' },
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
                  ? 'The candidate with the fewest votes in the round.'
                  : s.elimination === 'btr'
                    ? 'The two lowest are compared head-to-head on the ballots still in play; the loser goes.'
                    : 'The candidate with the lowest Borda score across the ballots still in play (STV-B).'
              }
            >
              <Seg
                value={s.elimination}
                onChange={(v) => set({ elimination: v })}
                options={[
                  { value: 'lowest', label: 'Fewest votes' },
                  { value: 'btr', label: 'Bottom-two runoff' },
                  { value: 'borda', label: 'Lowest Borda' },
                ]}
              />
            </Field>

            <Field
              label="Value kept when a ballot moves after an elimination"
              tag="charter"
              help={s.decay < 1 ? `A backup choice receives ${pct(s.decay, 0)} of the ballot; the rest is destroyed.` : 'Full value — a backup choice gets the whole remaining ballot.'}
            >
              <Range value={s.decay} min={0.5} max={1} step={0.05} show={pct(s.decay, 0)} onChange={(v) => set({ decay: v })} />
            </Field>

            <Field
              label="When candidates left = seats left"
              tag="charter"
              help={
                s.completion === 'elect-remaining'
                  ? 'Whoever is still standing is elected, threshold or not.'
                  : 'Nobody wins by default: open seats go to a fresh count with every ballot at full value.'
              }
            >
              <Seg
                value={s.completion}
                onChange={(v) => set({ completion: v })}
                options={[
                  { value: 'elect-remaining', label: 'Elect whoever remains' },
                  { value: 'finisher', label: 'Fresh count' },
                ]}
              />
            </Field>

            <Field
              label="Seats held out for a districtwide count"
              tag="charter"
              help={
                s.resetSeats === 0
                  ? 'All seats come from the transferable-vote count.'
                  : Math.min(s.resetSeats, seats) >= seats
                    ? 'Every seat is its own full-value contest — sequential, majoritarian.'
                    : `STV fills ${seats - Math.min(s.resetSeats, seats)}; then ballots are restored and the district fills the rest.`
              }
            >
              <Range value={Math.min(s.resetSeats, seats)} min={0} max={seats} step={1} show={String(Math.min(s.resetSeats, seats))} onChange={(v) => set({ resetSeats: v })} />
            </Field>
            {(s.resetSeats > 0 || s.completion === 'finisher') && (
              <div className="pair">
                <Field label="Fresh count uses">
                  <Seg
                    value={s.finisher}
                    onChange={(v) => set({ finisher: v })}
                    options={[
                      { value: 'condorcet', label: 'Condorcet' },
                      { value: 'irv', label: 'Instant runoff' },
                    ]}
                  />
                </Field>
                {s.resetSeats > 0 && s.resetSeats < seats && (
                  <Field label="Threshold based on">
                    <Seg
                      value={s.quotaBasis}
                      onChange={(v) => set({ quotaBasis: v })}
                      options={[
                        { value: 'all', label: 'All seats' },
                        { value: 'stv', label: 'STV seats' },
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
            label="Keep-value rule"
            help={
              s.meekVariant === 'meek'
                ? 'Each winner keeps a fixed proportion of every ballot that reaches them and passes the rest on. The quota falls as ballots run out.'
                : 'Each winner takes the same absolute portion from every supporting ballot, as far as the ballot’s remaining value allows.'
            }
          >
            <Seg
              value={s.meekVariant}
              onChange={(v) => set({ meekVariant: v })}
              options={[
                { value: 'meek', label: 'Meek (multiplicative)' },
                { value: 'warren', label: 'Warren (additive)' },
              ]}
            />
          </Field>
        )}

        {s.method === 'mcpc' && (
          <>
            <Field label="A voter consents to their top…" help="Support overlaps: one voter can stand behind every winner.">
              <Range value={s.consentDepth} min={1} max={6} step={1} show={`${s.consentDepth} ranked`} onChange={(v) => set({ consentDepth: v })} />
            </Field>
            <Field
              label="Mandate every winner must hold (μ)"
              help="Share of all voters consenting to the candidate. Among committees that clear the bar, the one with the best proportional-representation score wins. If none can, the bar drops to the highest the field can meet — and says so."
            >
              <Range value={s.mandate} min={0} max={0.6} step={0.01} show={pct(s.mandate, 0)} onChange={(v) => set({ mandate: v })} />
            </Field>
          </>
        )}

        {s.method === 'sntv' && <div className="field__help">A floor to compare against: the top first-choice vote-getters win and rankings do nothing.</div>}
      </div>
    </div>
  )
}
