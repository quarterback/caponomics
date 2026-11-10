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
            Ballot Buffet is a <strong>ranked-choice counting laboratory</strong>. Single transferable vote is a family of
            rules, and two counts that both call themselves STV can seat different people. Pick the rules, pick the ballots,
            and read who wins and what it cost.
          </p>

          <h3>The counting rule is the subject</h3>
          <p>
            A count is a handful of interchangeable decisions: the threshold, how a winner’s surplus moves on, who gets cut,
            what a transferred ballot is worth, and what happens when candidates run out before seats do. Portland’s 2024
            count is one setting of those switches. Meek, bottom-two runoff, a Hare threshold, a 2+1 hybrid and the rest are
            others.
          </p>

          <h3>Ballots are separate from rules</h3>
          <p>
            Any set of ballots runs through any system. The generated district has a cohesion dial: at the low end voters
            rank on personal pull and candidates behave like free radicals; at the high end they rank down a slate. The
            hand-built sets each isolate one effect and can be edited as text.
          </p>

          <h3>The same yardsticks for every system</h3>
          <p>
            Weakest mandate is the share of voters who put the least-supported winner in their top three. Vote value behind
            no one is what ran out of rankings or was destroyed by a rule. A head-to-head upset is a loser whom more voters
            ranked above a winner than below; proportional systems produce these by design, so read the number alongside the
            seats each camp won.
          </p>

          <h3>Charter or code</h3>
          <p>
            Each rule is tagged by where it lives in Portland law. Charter §3-102 fixes single transferable vote, a threshold
            tied to the number of seats, surplus transfers to next-ranked candidates, and elimination of the lowest-polling
            candidates. City Code 2.08.030 holds the arithmetic and can be changed by ordinance. The tags are a plain
            reading of those texts and are not legal advice.
          </p>

          <h3>A calculator</h3>
          <p>
            It reports what a rule does to a set of ballots. Generated ballots are synthetic and are not Portland’s cast vote
            record. Ties are broken deterministically here; Portland draws lots.
          </p>
        </div>
      </div>
    </div>
  )
}
