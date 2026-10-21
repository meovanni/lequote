// Rimborso di un recesso: entro 14 giorni dalla dichiarazione (Cod. Consumo art. 56).
const REFUND_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

export type RefundDeadline = {
  due: Date
  /** Giorni di calendario (ora italiana) che restano: 0 il giorno della scadenza, negativo dopo. */
  daysLeft: number
  level: 'ok' | 'soon' | 'late'
}

/** Il giorno di calendario a Roma, come millisecondi UTC della mezzanotte. */
function romeDay(date: Date): number {
  const [year, month, day] = date.toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' }).split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function refundDeadline(submittedAt: string, now = new Date()): RefundDeadline {
  const due = new Date(new Date(submittedAt).getTime() + REFUND_DAYS * DAY_MS)
  const daysLeft = Math.round((romeDay(due) - romeDay(now)) / DAY_MS)
  const level = daysLeft < 0 ? 'late' : daysLeft <= 3 ? 'soon' : 'ok'
  return { due, daysLeft, level }
}
