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
            Cap Buffet is a <strong>salary-cap system laboratory</strong>. Design a cap from reusable
            mechanics, point it at a whole league, and read the results: who sits over the cap, who
            owes tax, who falls below the floor, and what penalties apply.
          </p>

          <h3>The ruleset is the subject</h3>
          <p>
            Cap Buffet works at the level of the rules themselves: ceilings, floors, taxes, aprons,
            and the penalties that follow from them. Change one rule and the league-wide table
            updates instantly.
          </p>

          <h3>Legality is objective</h3>
          <p>
            Cap Buffet reports what your rules produce and leaves the interpretation to you. A team
            is legal or illegal by the numbers. Everything past that point is yours to read.
          </p>

          <h3>Composable mechanics</h3>
          <p>
            A cap system is an ordered stack of modules: revenue, cap formula, hard cap, salary
            floor, luxury tax, aprons, allocation money, and draft-pick penalties. The major leagues
            ship as presets built from the same kit, so you can graft one league’s mechanic onto
            another. Put a second apron on the NFL, or run NBA payrolls under the NHL hard cap.
          </p>

          <h3>Any league, any scale</h3>
          <p>
            Financials are arbitrary. Run a minor league, the A-League, the CFL, or a fantasy world,
            and set the cap to $40 if that is the number you want. The engine treats every figure
            the same way.
          </p>

          <h3>How to use it</h3>
          <ol>
            <li>Choose a cap system, or start blank, and pick a league to test it against.</li>
            <li>Add, remove, and tune mechanics in the builder.</li>
            <li>Read the league overview: illegal teams, tax collected, floor violations, balance.</li>
            <li>Save your ruleset or share it with the link button.</li>
          </ol>

          <p className="about__foot">
            Cap hits are input data in this build. The transaction sandbox (proration, dead money,
            buyouts, exceptions) and side-by-side comparison are on the roadmap.
          </p>
        </div>
      </div>
    </div>
  )
}
