import { fmtMoney, fmtMoneyExact } from '../../../engine/format'
import type { League, TeamYearReport } from '../../../engine/types'

const TYPE_LABEL: Record<string, string> = {
  base: 'Player salaries',
  proration: 'Proration',
  deadMoney: 'Dead money',
  bonus: 'Bonuses',
  retained: 'Retained salary',
  hold: 'Cap holds',
}

export function CapSheet({ report, league }: { report: TeamYearReport; league: League }) {
  // Group charges by type; base is the big list of players.
  const groups = new Map<string, typeof report.capSheet>()
  for (const ch of report.capSheet) {
    const arr = groups.get(ch.type) ?? []
    arr.push(ch)
    groups.set(ch.type, arr)
  }

  return (
    <div>
      {[...groups.entries()].map(([type, charges]) => {
        const subtotal = charges.reduce((a, c) => a + c.amount, 0)
        const sorted = [...charges].sort((a, b) => b.amount - a.amount)
        return (
          <div className="capsheet__group" key={type}>
            <div className="capsheet__grouphead">
              <span>{TYPE_LABEL[type] ?? type}</span>
              <span className="mono">{fmtMoney(subtotal)}</span>
            </div>
            {sorted.map((c, i) => {
              const p = c.playerId ? league.players[c.playerId] : undefined
              return (
                <div className="capsheet__row" key={c.contractId ?? i}>
                  <span className="name">
                    {p?.name ?? c.note ?? 'Charge'}
                    {p && <span className="pos">{p.pos}</span>}
                  </span>
                  <span className="amt mono" title={fmtMoneyExact(c.amount)}>
                    {fmtMoney(c.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
      <div className="capsheet__total">
        <span>Total cap salary</span>
        <span className="mono">{fmtMoneyExact(report.totals.capSalary)}</span>
      </div>
    </div>
  )
}
