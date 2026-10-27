import { FORMATS, type ProductLine } from './formats'

// Listino legato al prezzo al litro (olio) o al chilo (miele). Il prezzo standard di un formato è
// il prodotto che contiene più il costo di confezione e lavoro per pezzo, che pesa di più sui
// formati piccoli (una bottiglia da 750 ml costa da riempire quasi come una latta), arrotondato per
// eccesso ai 50 centesimi così i conti tornano pari. Un formato può avere un prezzo scelto a mano:
// resta quello finché non lo si riallinea allo standard.

export type LinePricing = {
  unitPrice: number
  /** Costo di confezione e lavoro per pezzo, IVA inclusa. */
  surcharges: Record<string, number>
  /** Prezzi scelti a mano, al posto dello standard. */
  overrides: Record<string, number>
}

/** Costo di confezione e lavoro di partenza per pezzo: maggiore per i formati piccoli. */
export const DEFAULT_SURCHARGE: Record<string, number> = {
  'OLIO-750ML': 1.5,
  'OLIO-5L': 0,
  'MIELE-250G': 1.5,
  'MIELE-500G': 1,
}

const cents = (value: number) => Math.round(value * 100) / 100
/** Per eccesso ai 50 centesimi: 11,25 → 11,50; 12,00 resta 12,00. */
export const roundUpToHalf = (value: number) => Math.ceil(cents(value) * 2 - 1e-9) / 2

function formatOf(sku: string) {
  const format = FORMATS.find((entry) => entry.sku === sku)
  if (!format) throw new Error(`Formato sconosciuto: ${sku}`)
  return format
}

export const surchargeOf = (sku: string, pricing: Pick<LinePricing, 'surcharges'>) => pricing.surcharges[sku] ?? DEFAULT_SURCHARGE[sku] ?? 0

/** Prezzo standard IVA inclusa: per lo sfuso è il prezzo al litro o al chilo. */
export function standardPriceOf(sku: string, pricing: Pick<LinePricing, 'unitPrice' | 'surcharges'>): number {
  const format = formatOf(sku)
  if (format.bulk) return cents(pricing.unitPrice)
  return roundUpToHalf((pricing.unitPrice * format.size) / 1000 + surchargeOf(sku, pricing))
}

/** Prezzo in vendita: quello scelto a mano, se c'è, altrimenti lo standard. */
export function priceOf(sku: string, pricing: LinePricing): number {
  const override = pricing.overrides[sku]
  return override !== undefined && !formatOf(sku).bulk ? cents(override) : standardPriceOf(sku, pricing)
}

export type PriceEntry = { sku: string; price: number; standard: number; surcharge: number; custom: boolean }

/** Il listino di una linea, formato per formato. */
export function linePrices(line: ProductLine, pricing: LinePricing): PriceEntry[] {
  return FORMATS.filter((format) => format.line === line).map((format) => {
    const standard = standardPriceOf(format.sku, pricing)
    const price = priceOf(format.sku, pricing)
    return {
      sku: format.sku,
      price,
      standard,
      surcharge: format.bulk ? 0 : cents(surchargeOf(format.sku, pricing)),
      custom: !format.bulk && pricing.overrides[format.sku] !== undefined,
    }
  })
}
