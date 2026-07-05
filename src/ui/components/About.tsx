export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide about" onClick={(e) => e.stopPropagation()}>
        <div className="card__head">
          <span className="card__title">About Cap Buffet</span>
          <button className="btn--icon" style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about__body">
          <p className="about__lede">
            Cap Buffet is a <strong>salary-cap system laboratory</strong>. Design a cap out of
            reusable mechanics, point it at an entire league, and watch how it plays out — who’s over,
            who owes what, who’s under the floor, and what penalties land.
          </p>

          <h3>It models the cap, not the contracts</h3>
          <p>
            This isn’t a trade machine or a contract simulator — tools like PuckPedia, Spotrac and
            SalarySwish already do that. caponomics is about the <em>system</em>: the ceilings,
            floors, taxes, aprons and penalties, and how a whole league behaves under them. Change a
            rule and the league-wide table updates instantly.
          </p>

          <h3>A calculator, not a prescription</h3>
          <p>
            It computes the consequences of whatever rules you invent and passes no judgment on
            whether a cap design is good or fair. Legality is objective; everything else is just
            numbers you can read.
          </p>

          <h3>Composable mechanics</h3>
          <p>
            A cap system is an ordered stack of modules — revenue → cap formula, hard cap, salary
            floor, luxury tax, aprons, allocation money, draft-pick penalties and more. The four
            major leagues are just presets of the same kit, so you can mix and match across them:
            put a second apron on the NFL, or run NBA payrolls under the NHL’s hard cap.
          </p>

          <h3>Any league, any scale</h3>
          <p>
            Financials are arbitrary — a minor league, the A-League, the CFL, a fantasy world. Set
            the cap to $40 if you want. Nothing assumes real-world dollar amounts.
          </p>

          <h3>How to use it</h3>
          <ol>
            <li>Pick a cap system (or start blank) and a league to test it against.</li>
            <li>Add, remove and tune mechanics in the builder.</li>
            <li>Read the league overview — illegal teams, tax collected, floor violations, balance.</li>
            <li>Save or share your ruleset via the link button.</li>
          </ol>

          <p className="about__foot">
            Cap hits are treated as input data in this build; the transaction sandbox (proration,
            dead money, buyouts, exceptions) and side-by-side system comparison are on the roadmap.
          </p>
        </div>
      </div>
    </div>
  )
}
