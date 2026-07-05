// Money formatting shared by engine reason strings and the UI.
// Currency-aware and scale-agnostic: renders $40, €300M, £120M, ₹18 cr sensibly.

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'INR' | 'JPY' | 'KRW'

interface CurrencyDef {
  symbol: string
  /** Indian numbering (lakh / crore) instead of K/M/B. */
  indian?: boolean
  /** East-Asian myriad grouping (man = 10^4, oku = 10^8). */
  eastAsian?: { oku: string; man: string; locale: string }
}

const CURRENCIES: Record<Currency, CurrencyDef> = {
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  GBP: { symbol: '£' },
  AUD: { symbol: 'A$' },
  CAD: { symbol: 'C$' },
  INR: { symbol: '₹', indian: true },
  JPY: { symbol: '¥', eastAsian: { oku: '億', man: '万', locale: 'ja-JP' } },
  KRW: { symbol: '₩', eastAsian: { oku: '억', man: '만', locale: 'ko-KR' } },
}

export function currencySymbol(cur: Currency = 'USD'): string {
  return CURRENCIES[cur]?.symbol ?? '$'
}

export const CURRENCY_LIST: Currency[] = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'JPY', 'KRW']

// Approximate USD value of one unit of each currency. Illustrative — the tool is
// scale-agnostic, so these just make cross-currency comparisons roughly sane.
const USD_PER: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  AUD: 0.66,
  CAD: 0.73,
  INR: 0.012,
  JPY: 0.0067,
  KRW: 0.00073,
}

/** Unrounded conversion factor from one currency to another. */
export function fxRate(from: Currency = 'USD', to: Currency = 'USD'): number {
  if (from === to) return 1
  return USD_PER[from] / USD_PER[to]
}

/** Convert a raw amount from one currency to another (illustrative FX). */
export function fx(v: number, from: Currency = 'USD', to: Currency = 'USD'): number {
  if (from === to) return v
  return Math.round((v * USD_PER[from]) / USD_PER[to])
}

export function fmtMoney(v: number, cur: Currency = 'USD'): string {
  const def = CURRENCIES[cur] ?? CURRENCIES.USD
  const s = def.symbol
  const sign = v < 0 ? '-' : ''
  const n = Math.abs(v)
  if (def.eastAsian) {
    if (n >= 1e8) {
      const oku = n / 1e8
      return `${sign}${s}${oku >= 100 ? oku.toFixed(0) : oku.toFixed(oku % 1 === 0 ? 0 : 1)}${def.eastAsian.oku}`
    }
    if (n >= 1e4) return `${sign}${s}${Math.round(n / 1e4)}${def.eastAsian.man}`
    return `${sign}${s}${n.toLocaleString('en-US')}`
  }
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
  const locale = def.eastAsian ? def.eastAsian.locale : def.indian ? 'en-IN' : 'en-US'
  return `${sign}${def.symbol}${Math.abs(v).toLocaleString(locale)}`
}

/** Parse a lenient money string: "240M", "€1.5m", "18cr", "50 lakh", "68,000,000".
 *  Currency symbols and grouping are ignored. Returns null if unparseable. */
export function parseMoney(input: string): number | null {
  const s = input.trim().replace(/[$€£₹₩¥,\s]/g, '').replace(/a\$|c\$/gi, '')
  if (s === '') return null
  const match = /^(-?\d*\.?\d+)(k|m|b|cr|l|lakh|crore|억|億|oku|eok|만|万|man)?$/i.exec(s)
  if (!match) return null
  const n = parseFloat(match[1]!)
  if (!Number.isFinite(n)) return null
  const suffix = (match[2] ?? '').toLowerCase()
  const mult =
    suffix === 'b' ? 1e9
    : suffix === '억' || suffix === '億' || suffix === 'oku' || suffix === 'eok' ? 1e8
    : suffix === 'crore' || suffix === 'cr' ? 1e7
    : suffix === 'm' ? 1e6
    : suffix === 'lakh' || suffix === 'l' ? 1e5
    : suffix === '만' || suffix === '万' || suffix === 'man' ? 1e4
    : suffix === 'k' ? 1e3
    : 1
  return Math.round(n * mult)
}
