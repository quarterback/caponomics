export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide about" onClick={(e) => e.stopPropagation()}>
        <div className="card__head">
          <span className="card__title">About Ballot Buffet</span>
          <button className="btn--icon" style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about__body">
          <p className="about__lede">
            Ballot Buffet counts ranked-choice ballots under different rules. Two counts that both call themselves single
            transferable vote can seat different people. Pick the rules, pick the ballots, and see who wins.
          </p>

          <h3>What you can change</h3>
          <p>
            The threshold, how a winner’s surplus votes move on, who is eliminated, what a transferred ballot is worth, and
            what happens when candidates run out before seats do. Portland’s 2024 count is one setting of those rules. The
            other presets change one or two of them.
          </p>

          <h3>Ballots</h3>
          <p>
            Any set of ballots runs through any rules. The generated district has a cohesion slider: at the low end voters
            rank candidates one by one, at the high end they rank a slate. Each hand-built set shows one effect, and you
            can edit any set as text.
          </p>

          <h3>What the numbers mean</h3>
          <p>
            <strong>Least-supported winner</strong> is the share of voters who ranked that winner in their top three.{' '}
            <strong>Votes that ran out</strong> is vote value that ended with no candidate, because the ballot had no
            rankings left or a rule discarded it. <strong>Losers preferred to a winner</strong> counts losing candidates
            whom more voters ranked above a winner than below. Proportional counts produce these on purpose, so read that
            number next to the seats each camp won.
          </p>

          <h3>Charter and code tags</h3>
          <p>
            Each rule is tagged by where Portland law sets it. Charter §3-102 requires single transferable vote, a
            threshold tied to the number of seats, surplus transfers to next-ranked candidates, and elimination of the
            lowest-polling candidates. City Code 2.08.030 sets the arithmetic, and Council can change it by ordinance. The
            tags are one reading of those texts. They are not legal advice.
          </p>

          <h3>Limits</h3>
          <p>
            The generated ballots are synthetic. They are not Portland’s cast vote record. This tool breaks ties by a fixed
            rule; Portland draws lots.
          </p>
        </div>
      </div>
    </div>
  )
}
