// Dati di etichetta del lotto calcolati da altri dati: unità della quantità nominale (litri per
// l'olio, chili per il miele) e termine minimo di conservazione proposto dal confezionamento.

export type ProductLine = 'olio' | 'miele'

export const NOMINAL_UNIT: Record<ProductLine, string> = { olio: 'L', miele: 'kg' }

/** Mesi tra confezionamento e termine minimo di conservazione proposto. */
export const BEST_BEFORE_MONTHS = 18

/** Il numero della quantità nominale ("0.75", "0,75 l" dei lotti vecchi); null se non c'è. */
export function nominalQuantityValue(text: string | null | undefined): number | null {
  const match = /\d+(?:[.,]\d+)?/.exec(text ?? '')
  return match ? Number(match[0].replace(',', '.')) : null
}

/** Quantità nominale come la legge il pubblico: "0,75 L", "0,5 kg". Un testo senza numero resta com'è. */
export function formatNominalQuantity(text: string | null | undefined, line: ProductLine): string | null {
  const value = nominalQuantityValue(text)
  if (value === null) return text?.trim() ? text.trim() : null
  return `${String(value).replace('.', ',')} ${NOMINAL_UNIT[line]}`
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
