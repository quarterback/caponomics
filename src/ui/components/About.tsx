export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide about" onClick={(e) => e.stopPropagation()}>
        <div className="card__head">
          <span className="card__title">What is Cap Buffet?</span>
          <button className="btn--icon" style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about__body">
          <p className="about__lede">
            Cap Buffet is a <strong>tool for designing salary-cap systems</strong>. You build a cap
            from reusable mechanics and apply it to a whole league. Cap Buffet then shows which teams
            are over the cap, which owe tax, which are below the floor, and what penalties apply.
          </p>

          <h3>What does it work on?</h3>
          <p>
            Cap Buffet works on the rules: ceilings, floors, taxes, aprons, and the penalties
            attached to them. When you change a rule, the league table updates.
          </p>

          <h3>How does it decide what is legal?</h3>
          <p>
            Cap Buffet applies your rules to each team’s numbers and reports whether the team is
            legal. It does not judge whether the rules are good.
          </p>

          <h3>How is a cap system built?</h3>
          <p>
            A cap system is an ordered list of modules: revenue, cap formula, hard cap, salary
            floor, luxury tax, aprons, allocation money, and draft-pick penalties. The major leagues
            come as presets built from the same modules, so you can add one league’s mechanic to
            another. For example, you can give the NFL a second apron, a spending line above the
            tax with its own restrictions. You can also apply the NHL hard cap to NBA payrolls.
          </p>

          <h3>Which leagues can I use?</h3>
          <p>
            You can use any league and any amounts. Cap Buffet works for a minor league, the
            A-League, the CFL, or a league you invent. You can set the cap to $40. The engine treats
            every amount the same way.
          </p>

          <h3>How do I use it?</h3>
          <ol>
            <li>Choose a cap system, or start blank, and pick a league to test it against.</li>
            <li>Add, remove, and adjust mechanics in the builder.</li>
            <li>
              Read the league overview. It shows illegal teams, tax collected, teams below the
              floor, and payroll balance.
            </li>
            <li>Save your ruleset or share it with the link button.</li>
          </ol>

          <p className="about__foot">
            In this version, cap hits come from the roster data. Cap Buffet does not yet model
            transactions such as proration, dead money, buyouts and exceptions, or compare systems
            side by side. Both are planned.
          </p>
        </div>
      </div>
    </div>
  )
}
