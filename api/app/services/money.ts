/**
 * Decimal columns come back as strings on PostgreSQL and numbers on SQLite.
 * Always hand numbers (or null) to the client.
 */
export function toMoney(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}
