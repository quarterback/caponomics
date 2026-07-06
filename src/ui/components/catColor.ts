/** Category → CSS color var. Works for both cap-module and expansion-rule
 *  categories — each has a `--cat-*` variable defined in theme.css. */
export function catColor(cat: string): string {
  return `var(--cat-${cat})`
}
