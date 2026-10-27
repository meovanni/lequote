import { useQuery } from '@tanstack/react-query'
import { sdk } from './sdk'
import type { Booking } from './sales-api'

// Dati della pagina Gestione (src/api/admin/gestione): magazzino in litri e chili, prezzi dei formati
// e ultimi ordini. Le quantità del magazzino arrivano in millilitri o grammi per lo sfuso e in pezzi
// per i formati. Le modifiche passano da useSalesAction, che ricarica anche questa pagina.

export type ProductLine = 'olio' | 'miele'

export type FormatRow = {
  sku: string
  line: ProductLine
  /** Millilitri o grammi per pezzo (per lo sfuso, per litro o chilo). */
  size: number
  label: string
  bulk: boolean
  variantId: string | null
  /** Prezzo IVA inclusa, calcolato dal prezzo al litro o al chilo più il supplemento. */
  price: number | null
  /** Prezzo standard: prodotto contenuto più confezione, arrotondato per eccesso ai 50 centesimi. */
  standardPrice: number | null
  /** Prezzo scelto a mano al posto dello standard. */
  custom: boolean
  /** Costo di confezione e lavoro per pezzo, IVA inclusa (0 per lo sfuso). */
  surcharge: number
  available: number
}

export type LineRow = {
  line: ProductLine
  unit: 'L' | 'kg'
  defaultPacking: string
  /** Prezzo al litro o al chilo IVA inclusa: da qui si calcolano i prezzi dei formati. */
  unitPrice: number
  bulk: number
  bulkOrdered: number
  freeBulk: number
  total: number
  free: number
  bulkAvailable: number
  formats: { sku: string; ready: number; ordered: number; toPack: number; available: number }[]
}

export type GestioneOrder = Booking & { agent: string | null }

export type Gestione = { lines: LineRow[]; formats: FormatRow[]; orders: GestioneOrder[] }

export const LINE_LABEL: Record<ProductLine, string> = { olio: 'Olio', miele: 'Miele' }

// Ordini e magazzino cambiano anche per il sito e gli agenti: la pagina si ricarica da sola.
export function useGestione() {
  return useQuery({
    queryKey: ['vendite', 'gestione'],
    queryFn: () => sdk.client.fetch<Gestione>('/admin/gestione'),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

const decimal = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 })
const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

/** Valore della merce in magazzino ai prezzi di listino: sfuso al litro o al chilo, pezzi pronti al loro prezzo. */
export function stockValue(line: LineRow, formats: FormatRow[]): number {
  const ready = line.formats.reduce((sum, row) => sum + row.ready * (formats.find((format) => format.sku === row.sku)?.price ?? 0), 0)
  return (line.bulk / 1000) * line.unitPrice + ready
}

/** Da millilitri o grammi a "12,5 L" o "3 kg". */
export const formatVolume = (amount: number, unit: 'L' | 'kg') => `${decimal.format(amount / 1000)} ${unit}`

/**
 * Una riga d'ordine a parole: "2 × Olio bottiglia 750 ml" oppure, per lo sfuso, "20 L da
 * imbottigliare (4 latte da 5 L)" con il formato in cui si confeziona di norma.
 */
export function describeLine(
  line: { variantId: string | null; sku: string; quantity: number; title: string; subtitle: string; unitPrice: number },
  formats: FormatRow[],
  lines: LineRow[],
): string {
  // Il prezzo è quello fissato quando l'ordine è nato: un cambio di listino vale per gli ordini nuovi.
  const at = ` a ${euro.format(line.unitPrice)}`
  const format = formats.find((entry) => entry.variantId === line.variantId || entry.sku === line.sku)
  if (!format) return `${line.quantity} × ${line.subtitle || line.title}${at}`
  const product = format.line === 'olio' ? 'Olio' : 'Miele'
  if (!format.bulk) return `${line.quantity} × ${product} ${format.label.toLowerCase()}${at}`
  const unit = format.line === 'olio' ? 'L' : 'kg'
  const packing = formats.find((entry) => entry.sku === lines.find((row) => row.line === format.line)?.defaultPacking)
  const pieces = packing ? Math.ceil((line.quantity * format.size) / packing.size) : null
  const hint = packing && pieces ? ` (${pieces} × ${packing.label.toLowerCase()})` : ''
  return `${formatVolume(line.quantity * format.size, unit)} ${format.line === 'olio' ? 'da imbottigliare' : 'da invasettare'}${hint}${at}/${unit}`
}
