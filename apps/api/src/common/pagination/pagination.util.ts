export function normalizePagination(
  limit?: number | string,
  offset?: number | string,
  defaults: { limit?: number; offset?: number; maxLimit?: number } = {},
) {
  const maxLimit = defaults.maxLimit ?? 100;
  let l = Number(limit ?? defaults.limit ?? 20);
  let o = Number(offset ?? defaults.offset ?? 0);
  if (!Number.isFinite(l) || l <= 0) l = defaults.limit ?? 20;
  if (!Number.isFinite(o) || o < 0) o = defaults.offset ?? 0;
  if (l > maxLimit) l = maxLimit;
  return { limit: l, offset: o };
}

