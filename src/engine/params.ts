// Tiny typed readers for module params (params arrive as unknown JSON).
type Bag = Record<string, unknown>

export function num(p: Bag, key: string, fallback = 0): number {
  const v = p[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

export function bool(p: Bag, key: string, fallback = false): boolean {
  const v = p[key]
  return typeof v === 'boolean' ? v : fallback
}

export function str(p: Bag, key: string, fallback = ''): string {
  const v = p[key]
  return typeof v === 'string' ? v : fallback
}

export function strList(p: Bag, key: string, fallback: string[] = []): string[] {
  const v = p[key]
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : fallback
}

export function objList(p: Bag, key: string, fallback: Bag[] = []): Bag[] {
  const v = p[key]
  return Array.isArray(v) ? (v.filter((x) => typeof x === 'object' && x !== null) as Bag[]) : fallback
}
