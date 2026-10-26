// I formati in vendita e quanto prodotto contiene ciascuno. Tutto il magazzino si conta in
// millilitri d'olio e grammi di miele (numeri interi, niente arrotondamenti): lo sfuso è una
// quantità, i formati sono pezzi già confezionati. "Da imbottigliare" (olio) e "Da invasettare"
// (miele) sono le righe d'ordine in litri o chili, prese dallo sfuso: il formato si decide dopo.

export type ProductLine = 'olio' | 'miele'

export type Format = {
  sku: string
  line: ProductLine
  /** Millilitri o grammi per pezzo; per lo sfuso, per unità ordinata (1 L o 1 kg). */
  size: number
  label: string
  /** Riga in litri o chili presa dallo sfuso, formato da decidere. */
  bulk: boolean
}

export const FORMATS: Format[] = [
  { sku: 'OLIO-SFUSO', line: 'olio', size: 1000, label: 'Da imbottigliare (litri)', bulk: true },
  { sku: 'OLIO-750ML', line: 'olio', size: 750, label: 'Bottiglia 750 ml', bulk: false },
  { sku: 'OLIO-5L', line: 'olio', size: 5000, label: 'Latta 5 L', bulk: false },
  { sku: 'MIELE-SFUSO', line: 'miele', size: 1000, label: 'Da invasettare (kg)', bulk: true },
  { sku: 'MIELE-250G', line: 'miele', size: 250, label: 'Vasetto 250 g', bulk: false },
  { sku: 'MIELE-500G', line: 'miele', size: 500, label: 'Vasetto 500 g', bulk: false },
]

export const LINES: ProductLine[] = ['olio', 'miele']

/** Unità di misura di una linea: litri per l'olio, chili per il miele. */
export const LINE_UNIT: Record<ProductLine, 'L' | 'kg'> = { olio: 'L', miele: 'kg' }

/** Formato in cui si confeziona di norma una riga "da imbottigliare". */
export const DEFAULT_PACKING: Record<ProductLine, string> = { olio: 'OLIO-5L', miele: 'MIELE-500G' }

const BY_SKU = new Map(FORMATS.map((format) => [format.sku, format]))

export function formatOf(sku: string | null | undefined): Format | undefined {
  return sku ? BY_SKU.get(sku) : undefined
}

export const bulkSku = (line: ProductLine) => FORMATS.find((format) => format.line === line && format.bulk)!.sku
export const packedFormats = (line: ProductLine) => FORMATS.filter((format) => format.line === line && !format.bulk)
