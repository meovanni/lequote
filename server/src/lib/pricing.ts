import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { updateProductVariantsWorkflow } from '@medusajs/medusa/core-flows'
import { bulkSku, FORMATS, type ProductLine } from '../modules/magazzino/lib/formats'
import { linePrices, type LinePricing, type PriceEntry } from '../modules/magazzino/lib/pricing'

// Il listino in Medusa (prezzi delle varianti, quelli che usano sito, carrello e gestionale) si
// ricava dal prezzo al litro o al chilo della riga sfusa, dal costo di confezione di ogni formato e
// dagli eventuali prezzi scelti a mano (modules/magazzino/lib/pricing.ts). Costo di confezione e
// prezzo scelto a mano stanno nei metadati della variante.

type VariantRow = { id: string; sku: string | null; metadata: Record<string, unknown> | null; prices: { amount: number; currency_code: string }[] | null }

async function variants(container: MedusaContainer, line: ProductLine): Promise<VariantRow[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const skus = FORMATS.filter((format) => format.line === line).map((format) => format.sku)
  const { data } = await query.graph({ entity: 'product_variant', fields: ['id', 'sku', 'metadata', 'prices.amount', 'prices.currency_code'], filters: { sku: skus } })
  return data as unknown as VariantRow[]
}

const eur = (row: VariantRow | undefined) => Number(row?.prices?.find((price) => price.currency_code === 'eur')?.amount ?? 0)
// Un metadato vuoto ("") vale come assente: è così che Medusa toglie una chiave.
const numberOr = (value: unknown): number | undefined => (value === '' || value === null || value === undefined ? undefined : Number(value))

function pricingOf(rows: VariantRow[], line: ProductLine): LinePricing {
  const packed = rows.filter((row) => row.sku && row.sku !== bulkSku(line))
  return {
    unitPrice: eur(rows.find((row) => row.sku === bulkSku(line))),
    surcharges: Object.fromEntries(packed.flatMap((row) => (numberOr(row.metadata?.packaging_surcharge) === undefined ? [] : [[row.sku!, numberOr(row.metadata?.packaging_surcharge)!]]))),
    overrides: Object.fromEntries(packed.flatMap((row) => (numberOr(row.metadata?.custom_price) === undefined ? [] : [[row.sku!, numberOr(row.metadata?.custom_price)!]]))),
  }
}

/** Prezzo al litro o al chilo, costi di confezione e prezzi scelti a mano della linea. */
export async function currentPricing(container: MedusaContainer, line: ProductLine): Promise<LinePricing> {
  return pricingOf(await variants(container, line), line)
}

/** Il listino della linea con prezzo standard e prezzo in vendita di ogni formato. */
export async function currentPrices(container: MedusaContainer, line: ProductLine): Promise<{ pricing: LinePricing; prices: PriceEntry[] }> {
  const pricing = await currentPricing(container, line)
  return { pricing, prices: linePrices(line, pricing) }
}

export type PricingChange = {
  unitPrice?: number
  surcharges?: Record<string, number>
  /** Prezzo scelto a mano per uno SKU; null lo riallinea allo standard. */
  overrides?: Record<string, number | null>
}

/** Applica la modifica e riscrive i prezzi di tutti i formati della linea. */
export async function updatePricing(container: MedusaContainer, line: ProductLine, change: PricingChange): Promise<LinePricing> {
  const rows = await variants(container, line)
  if (!rows.some((row) => row.sku === bulkSku(line))) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Manca la riga sfusa nel catalogo: lancia "npm run migrate".')
  }
  const current = pricingOf(rows, line)
  const overrides = { ...current.overrides }
  for (const [sku, price] of Object.entries(change.overrides ?? {})) {
    if (price === null) delete overrides[sku]
    else overrides[sku] = price
  }
  const next: LinePricing = {
    unitPrice: change.unitPrice ?? current.unitPrice,
    surcharges: { ...current.surcharges, ...(change.surcharges ?? {}) },
    overrides,
  }
  for (const entry of linePrices(line, next)) {
    const row = rows.find((candidate) => candidate.sku === entry.sku)
    if (!row) continue
    await updateProductVariantsWorkflow(container).run({
      input: {
        selector: { id: row.id },
        update: {
          prices: [{ currency_code: 'eur', amount: entry.price }],
          metadata: { ...(row.metadata ?? {}), packaging_surcharge: entry.surcharge, custom_price: entry.custom ? entry.price : '' },
        },
      },
    })
  }
  return next
}
