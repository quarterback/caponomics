// Money formatting shared by engine reason strings and the UI.
// Scale-agnostic: renders $40 and $300,000,000 sensibly, with compact millions.

export function fmtMoney(v: number): string {
  const sign = v < 0 ? '-' : ''
  const n = Math.abs(v)
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    const s = m >= 100 ? m.toFixed(0) : m.toFixed(m % 1 === 0 ? 0 : 1)
    return `${sign}$${s}M`
  }
  if (n >= 10_000) {
    return `${sign}$${(n / 1000).toFixed(0)}K`
  }
  return `${sign}$${n.toLocaleString('en-US')}`
}

/** Exact dollars with grouping — for cap-sheet rows where precision matters. */
export function fmtMoneyExact(v: number): string {
  const sign = v < 0 ? '-' : ''
  return `${sign}$${Math.abs(v).toLocaleString('en-US')}`
}

/** Parse a lenient money string: "240M", "$1.5m", "68,000,000", "40" → dollars.
 *  Returns null if it can't be parsed. Scale-agnostic (bare numbers pass through). */
export function parseMoney(input: string): number | null {
  const s = input.trim().replace(/[$,\s]/g, '')
  if (s === '') return null
  const match = /^(-?\d*\.?\d+)([kmb])?$/i.exec(s)
  if (!match) return null
  const n = parseFloat(match[1]!)
  if (!Number.isFinite(n)) return null
  const mult = match[2]?.toLowerCase() === 'b' ? 1e9 : match[2]?.toLowerCase() === 'm' ? 1e6 : match[2]?.toLowerCase() === 'k' ? 1e3 : 1
  return Math.round(n * mult)
}
