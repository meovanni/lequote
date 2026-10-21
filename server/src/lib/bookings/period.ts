import type { Period } from './read'

const DAY = /^\d{4}-\d{2}-\d{2}$/

/** Periodo da ?from=AAAA-MM-GG&to=AAAA-MM-GG, estremi compresi; le date non valide si ignorano. */
export function periodFromQuery(query: Record<string, unknown>): Period {
  const day = (value: unknown, end: boolean) =>
    typeof value === 'string' && DAY.test(value) ? new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z`) : undefined
  return { from: day(query.from, false), to: day(query.to, true) }
}
