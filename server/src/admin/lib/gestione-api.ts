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

/** Valore della merce in magazzino ai prezzi di listino: sfuso al litro o al chilo, pezzi pronti al loro prezzo. */
export function stockValue(line: LineRow, formats: FormatRow[]): number {
  const ready = line.formats.reduce((sum, row) => sum + row.ready * (formats.find((format) => format.sku === row.sku)?.price ?? 0), 0)
  return (line.bulk / 1000) * line.unitPrice + ready
}

/** Da millilitri o grammi a "12,5 L" o "3 kg". */
export const formatVolume = (amount: number, unit: 'L' | 'kg') => `${decimal.format(amount / 1000)} ${unit}`

/**
 * Nome e unità di una riga d'ordine, per le quantità modificabili nella riga: "Olio bottiglia
 * 750 ml" in pezzi, oppure "da imbottigliare (4 × latta 5 L)" in litri.
 */
export function lineParts(
  line: { variantId: string | null; sku: string; quantity: number; title: string; subtitle: string },
  formats: FormatRow[],
  lines: LineRow[],
): { label: string; unit: string; perUnit?: string } {
  const format = formats.find((entry) => entry.variantId === line.variantId || entry.sku === line.sku)
  if (!format) return { label: line.subtitle || line.title, unit: 'pz' }
  const product = format.line === 'olio' ? 'Olio' : 'Miele'
  if (!format.bulk) return { label: `${product} ${format.label.toLowerCase()}`, unit: 'pz' }
  const unit = format.line === 'olio' ? 'L' : 'kg'
  const packing = formats.find((entry) => entry.sku === lines.find((row) => row.line === format.line)?.defaultPacking)
  const pieces = packing ? Math.ceil((line.quantity * format.size) / packing.size) : null
  const hint = packing && pieces ? ` (${pieces} × ${packing.label.toLowerCase()})` : ''
  return { label: `${product.toLowerCase()} ${format.line === 'olio' ? 'da imbottigliare' : 'da invasettare'}${hint}`, unit, perUnit: unit }
}

