// Dati del lotto calcolati da altri dati: misure delle confezioni (litri per l'olio, chili per il
// miele), quanto è stato confezionato e il termine minimo di conservazione proposto.

export type ProductLine = 'olio' | 'miele'

/** Un formato confezionato nel lotto: misura in L o kg e numero di pezzi (interno). */
export type LotPackage = { size: number; count: number | null }

export const LOT_UNIT: Record<ProductLine, string> = { olio: 'L', miele: 'kg' }

/** Mesi tra confezionamento e termine minimo di conservazione proposto. */
export const BEST_BEFORE_MONTHS = 18

/** "0,75 L", "5 kg". */
export function formatMeasure(value: number, line: ProductLine): string {
  return `${String(value).replace('.', ',')} ${LOT_UNIT[line]}`
}

/**
 * Quantità nominale per il pubblico (Reg. UE 1169/2011): il contenuto di ciascuna confezione,
 * non il totale del lotto. Le misure del lotto dalla più piccola, "0,75 L · 5 L · 20 L"; null se
 * non ce ne sono.
 */
export function nominalQuantities(packages: LotPackage[] | null | undefined, line: ProductLine): string | null {
  const sizes = [...new Set((packages ?? []).map((item) => item.size).filter((size) => size > 0))].sort((a, b) => a - b)
  return sizes.length > 0 ? sizes.map((size) => formatMeasure(size, line)).join(' · ') : null
}

/** Litri o chili confezionati: somma di misura × pezzi, contando solo i formati con i pezzi. */
export function packagedTotal(packages: LotPackage[] | null | undefined): number {
  const total = (packages ?? []).reduce((sum, item) => sum + item.size * (item.count ?? 0), 0)
  return Math.round(total * 1000) / 1000
}

/** Il giorno (UTC, come le date del lotto) a BEST_BEFORE_MONTHS mesi; fine mese se il giorno non esiste (31/8 → 28/2). */
export function defaultBestBefore(packaging: Date | string): Date {
  const start = new Date(packaging)
  const month = start.getUTCMonth() + BEST_BEFORE_MONTHS
  const lastDay = new Date(Date.UTC(start.getUTCFullYear(), month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(start.getUTCFullYear(), month, Math.min(start.getUTCDate(), lastDay)))
}

const sameDay = (a: Date | string, b: Date | string) => new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10)

type Dates = { packaging_date?: Date | string | null; best_before?: Date | string | null }

/**
 * Il termine da salvare insieme a una modifica, o undefined per lasciarlo com'è. Segue il
 * confezionamento finché nessuno l'ha cambiato a mano: se era vuoto o era quello calcolato dalla
 * data di prima, si ricalcola dalla nuova. Un termine scritto a mano non si tocca.
 */
export function bestBeforeFor(current: Dates, changes: Dates): Date | undefined {
  if (changes.best_before !== undefined || !changes.packaging_date) return undefined
  const auto = !current.best_before || (current.packaging_date && sameDay(current.best_before, defaultBestBefore(current.packaging_date)))
  return auto ? defaultBestBefore(changes.packaging_date) : undefined
}
