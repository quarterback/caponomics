import type { ModuleCategory } from '../../engine/module'

export function catColor(cat: ModuleCategory): string {
  return `var(--cat-${cat})`
}
