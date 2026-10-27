import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { updateProductVariantsWorkflow } from '@medusajs/medusa/core-flows'
import { bulkSku, FORMATS, type ProductLine } from '../modules/magazzino/lib/formats'
import { linePrices, type LinePricing } from '../modules/magazzino/lib/pricing'

// Il listino in Medusa (prezzi delle varianti, quelli che usano sito, carrello e gestionale) si
// ricava dal prezzo al litro o al chilo della riga sfusa più il supplemento di ogni formato,
// salvato nei metadati della variante (modules/magazzino/lib/pricing.ts).

type VariantRow = { id: string; sku: string | null; metadata: Record<string, unknown> | null; prices: { amount: number; currency_code: string }[] | null }

async function variants(container: MedusaContainer, line: ProductLine): Promise<VariantRow[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const skus = FORMATS.filter((format) => format.line === line).map((format) => format.sku)
  const { data } = await query.graph({ entity: 'product_variant', fields: ['id', 'sku', 'metadata', 'prices.amount', 'prices.currency_code'], filters: { sku: skus } })
  return data as unknown as VariantRow[]
}

const eur = (row: VariantRow | undefined) => Number(row?.prices?.find((price) => price.currency_code === 'eur')?.amount ?? 0)

/** Prezzo al litro o al chilo e supplementi della linea, come sono salvati ora. */
export async function currentPricing(container: MedusaContainer, line: ProductLine): Promise<LinePricing> {
  const rows = await variants(container, line)
  const surcharges = Object.fromEntries(
    rows.flatMap((row) => (row.sku && row.sku !== bulkSku(line) ? [[row.sku, Number(row.metadata?.packaging_surcharge ?? 0)]] : [])),
  )
  return { unitPrice: eur(rows.find((row) => row.sku === bulkSku(line))), surcharges }
}

/** Cambia prezzo al litro e/o supplementi e riscrive i prezzi di tutti i formati della linea. */
export async function updatePricing(container: MedusaContainer, line: ProductLine, change: { unitPrice?: number; surcharges?: Record<string, number> }): Promise<LinePricing> {
  const rows = await variants(container, line)
  if (!rows.some((row) => row.sku === bulkSku(line))) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Manca la riga sfusa nel catalogo: lancia "npm run migrate".')
  }
  const current = await currentPricing(container, line)
  const next: LinePricing = { unitPrice: change.unitPrice ?? current.unitPrice, surcharges: { ...current.surcharges, ...(change.surcharges ?? {}) } }
  for (const entry of linePrices(line, next)) {
    const row = rows.find((candidate) => candidate.sku === entry.sku)
    if (!row) continue
    await updateProductVariantsWorkflow(container).run({
      input: {
        selector: { id: row.id },
        update: {
          prices: [{ currency_code: 'eur', amount: entry.price }],
          metadata: { ...(row.metadata ?? {}), packaging_surcharge: entry.surcharge },
        },
      },
    })
  }
  return next
}
