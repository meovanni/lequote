import { FORMATS, type ProductLine } from './formats'

// Listino legato al prezzo al litro (olio) o al chilo (miele): ogni formato costa quanto il
// prodotto che contiene, più un eventuale supplemento per la confezione (bottiglia, latta,
// vasetto). Cambiando il prezzo al litro cambiano tutti i formati della linea.

export type LinePricing = { unitPrice: number; surcharges: Record<string, number> }

const cents = (value: number) => Math.round(value * 100) / 100

/** Prezzo IVA inclusa di uno SKU: per lo sfuso è il prezzo al litro o al chilo. */
export function priceOf(sku: string, pricing: LinePricing): number {
  const format = FORMATS.find((entry) => entry.sku === sku)
  if (!format) throw new Error(`Formato sconosciuto: ${sku}`)
  if (format.bulk) return cents(pricing.unitPrice)
  return cents((pricing.unitPrice * format.size) / 1000 + (pricing.surcharges[sku] ?? 0))
}

/** Il listino di una linea: prezzo e supplemento di ogni SKU. */
export function linePrices(line: ProductLine, pricing: LinePricing): { sku: string; price: number; surcharge: number }[] {
  return FORMATS.filter((format) => format.line === line).map((format) => ({
    sku: format.sku,
    price: priceOf(format.sku, pricing),
    surcharge: format.bulk ? 0 : cents(pricing.surcharges[format.sku] ?? 0),
  }))
}
