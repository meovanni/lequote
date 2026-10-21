/** Intervallo di mesi (1 = gennaio, 12 = dicembre), estremi inclusi; può scavalcare dicembre. */
export interface MonthRange {
  from: number
  to: number
}

/** Segmento su una griglia di 12 colonne: colonna di partenza (1-12) e numero di colonne. */
export interface MonthSegment {
  start: number
  span: number
}

function assertMonth(month: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Mese non valido: ${month}`)
  }
}

export function monthSegments({ from, to }: MonthRange): MonthSegment[] {
  assertMonth(from)
  assertMonth(to)
  if (from <= to) return [{ start: from, span: to - from + 1 }]
  // A cavallo d'anno: il tratto di gennaio prima, così l'ordine segue la griglia.
  return [
    { start: 1, span: to },
    { start: from, span: 12 - from + 1 },
  ]
}

export function isActiveInMonth({ from, to }: MonthRange, month: number): boolean {
  return from <= to ? month >= from && month <= to : month >= from || month <= to
}

/** "maggio" per un mese singolo, "da novembre a febbraio" per un intervallo; `range` dà la forma nelle altre lingue. */
export function formatPeriod(
  { from, to }: MonthRange,
  monthNames: readonly string[],
  range: (from: string, to: string) => string = (start, end) => `da ${start} a ${end}`,
): string {
  assertMonth(from)
  assertMonth(to)
  const start = monthNames[from - 1]
  return from === to ? start : range(start, monthNames[to - 1])
}
