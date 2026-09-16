/**
 * `pt.list()` returns a BARE ARRAY, unless you pass `returnMetadata: true`, in which
 * case it returns `{ entities, count, pagination }`.
 *
 * This one fact produced a lint rule, a pt-doctor rule before it, and a bug in every
 * build report we have. `.entities` on the default shape is `undefined`, which reads
 * as "no rows" rather than as an error, so the app renders an empty state and nothing
 * anywhere says why.
 *
 * Import these instead of writing the guard again. This is deliberately the ONLY
 * platform helper the compiled template ships: `libraries/` is scoped to dynamic
 * no-build apps (see SKILL.md), and domain logic belongs in pure modules beside this
 * one, not behind a data layer.
 */

/** Rows from either `pt.list()` shape, always an array. */
export function rowsOf(result) {
  if (Array.isArray(result)) return result;
  return result?.entities ?? [];
}

/** Total matching rows. Only meaningful when the call passed `returnMetadata: true`. */
export function countOf(result) {
  if (Array.isArray(result)) return result.length;
  return result?.count ?? rowsOf(result).length;
}

/**
 * `pt.list()` plus `rowsOf()`, for the common case where you want the rows and nothing
 * else. Pass options exactly as `pt.list()` takes them.
 */
export async function listRows(options) {
  const pt = typeof window === 'undefined' ? undefined : window.pt;
  if (!pt) throw new Error('[pt-list] window.pt is not available (run inside a PrimeThink Live App)');
  return rowsOf(await pt.list(options));
}
