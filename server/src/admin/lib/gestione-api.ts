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
  price: number | null
  available: number
}

export type LineRow = {
  line: ProductLine
  unit: 'L' | 'kg'
  defaultPacking: string
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

/** Da millilitri o grammi a "12,5 L" o "3 kg". */
export const formatVolume = (amount: number, unit: 'L' | 'kg') => `${decimal.format(amount / 1000)} ${unit}`

/**
 * Una riga d'ordine a parole: "2 × Olio bottiglia 750 ml" oppure, per lo sfuso, "20 L da
 * imbottigliare (4 latte da 5 L)" con il formato in cui si confeziona di norma.
 */
export function describeLine(line: { variantId: string | null; sku: string; quantity: number; title: string; subtitle: string }, formats: FormatRow[], lines: LineRow[]): string {
  const format = formats.find((entry) => entry.variantId === line.variantId || entry.sku === line.sku)
  if (!format) return `${line.quantity} × ${line.subtitle || line.title}`
  const product = format.line === 'olio' ? 'Olio' : 'Miele'
  if (!format.bulk) return `${line.quantity} × ${product} ${format.label.toLowerCase()}`
  const unit = format.line === 'olio' ? 'L' : 'kg'
  const packing = formats.find((entry) => entry.sku === lines.find((row) => row.line === format.line)?.defaultPacking)
  const pieces = packing ? Math.ceil((line.quantity * format.size) / packing.size) : null
  const hint = packing && pieces ? ` (${pieces} × ${packing.label.toLowerCase()})` : ''
  return `${formatVolume(line.quantity * format.size, unit)} ${format.line === 'olio' ? 'da imbottigliare' : 'da invasettare'}${hint}`
}
