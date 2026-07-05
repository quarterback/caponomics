// Money formatting shared by engine reason strings and the UI.
// Currency-aware and scale-agnostic: renders $40, €300M, £120M, ₹18 cr sensibly.

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'INR'

interface CurrencyDef {
  symbol: string
  /** Indian numbering (lakh / crore) instead of K/M/B. */
  indian?: boolean
}

const CURRENCIES: Record<Currency, CurrencyDef> = {
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  GBP: { symbol: '£' },
  AUD: { symbol: 'A$' },
  CAD: { symbol: 'C$' },
  INR: { symbol: '₹', indian: true },
}

export function currencySymbol(cur: Currency = 'USD'): string {
  return CURRENCIES[cur]?.symbol ?? '$'
}

export function fmtMoney(v: number, cur: Currency = 'USD'): string {
  const def = CURRENCIES[cur] ?? CURRENCIES.USD
  const s = def.symbol
  const sign = v < 0 ? '-' : ''
  const n = Math.abs(v)
  if (def.indian) {
    if (n >= 1e7) {
      const cr = n / 1e7
      return `${sign}${s}${cr >= 100 ? cr.toFixed(0) : cr.toFixed(cr % 1 === 0 ? 0 : 1)} cr`
    }
    if (n >= 1e5) return `${sign}${s}${(n / 1e5).toFixed(0)} L`
    return `${sign}${s}${n.toLocaleString('en-IN')}`
  }
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `${sign}${s}${m >= 100 ? m.toFixed(0) : m.toFixed(m % 1 === 0 ? 0 : 1)}M`
  }
  if (n >= 10_000) return `${sign}${s}${(n / 1000).toFixed(0)}K`
  return `${sign}${s}${n.toLocaleString('en-US')}`
}

/** Exact amount with grouping — for rows where precision matters. */
export function fmtMoneyExact(v: number, cur: Currency = 'USD'): string {
  const def = CURRENCIES[cur] ?? CURRENCIES.USD
  const sign = v < 0 ? '-' : ''
  const locale = def.indian ? 'en-IN' : 'en-US'
  return `${sign}${def.symbol}${Math.abs(v).toLocaleString(locale)}`
}

/** Parse a lenient money string: "240M", "€1.5m", "18cr", "50 lakh", "68,000,000".
 *  Currency symbols and grouping are ignored. Returns null if unparseable. */
export function parseMoney(input: string): number | null {
  const s = input.trim().replace(/[$€£₹,\s]/g, '').replace(/a\$|c\$/gi, '')
  if (s === '') return null
  const match = /^(-?\d*\.?\d+)(k|m|b|cr|l|lakh|crore)?$/i.exec(s)
  if (!match) return null
  const n = parseFloat(match[1]!)
  if (!Number.isFinite(n)) return null
  const suffix = (match[2] ?? '').toLowerCase()
  const mult =
    suffix === 'b' ? 1e9
    : suffix === 'crore' || suffix === 'cr' ? 1e7
    : suffix === 'm' ? 1e6
    : suffix === 'lakh' || suffix === 'l' ? 1e5
    : suffix === 'k' ? 1e3
    : 1
  return Math.round(n * mult)
}
