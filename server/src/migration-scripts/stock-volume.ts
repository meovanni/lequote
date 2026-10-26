import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MathBN, Modules } from '@medusajs/framework/utils'
import { createProductVariantsWorkflow } from '@medusajs/medusa/core-flows'
import { MAGAZZINO_MODULE } from '../modules/magazzino'
import { FORMATS } from '../modules/magazzino/lib/formats'
import type MagazzinoModuleService from '../modules/magazzino/service'

// Magazzino in litri e chili (2026-10-26, modules/magazzino) sui database esistenti:
// 1. ogni prodotto riceve la riga sfusa ("Da imbottigliare (litri)", "Da invasettare (kg)");
// 2. Medusa smette di gestire le giacenze delle varianti (niente più riservato per sede);
// 3. i pezzi in magazzino di ogni formato passano al nuovo magazzino come pezzi pronti.
// Su un database nuovo, prima del seed, non c'è ancora nessun prodotto: fa tutto il seed.

const BULK = [
  { handle: 'olio-extravergine', sku: 'OLIO-SFUSO', title: 'Da imbottigliare (litri)', price: 15 },
  { handle: 'miele', sku: 'MIELE-SFUSO', title: 'Da invasettare (kg)', price: 16 },
]

type ProductRow = { id: string; handle: string; options: { id: string; title: string; values: { id: string; value: string }[] }[]; variants: { id: string; sku: string | null }[] }

export default async function stockVolume({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const products = container.resolve(Modules.PRODUCT)
  const rows = (await products.listProducts({}, { relations: ['options', 'options.values', 'variants'] })) as unknown as ProductRow[]
  if (rows.length === 0) {
    logger.info('Nessun prodotto: catalogo e magazzino li crea il seed.')
    return
  }

  for (const bulk of BULK) {
    const product = rows.find((row) => row.handle === bulk.handle)
    if (!product || product.variants.some((variant) => variant.sku === bulk.sku)) continue
    const option = product.options.find((entry) => entry.title === 'Formato')
    if (option) {
      // Dalla 2.16 i valori di un'opzione si collegano a ogni prodotto: il valore nuovo va aggiunto al prodotto.
      const existing = option.values.find((value) => value.value === bulk.title)
      await products.updateProductOptionValuesOnProduct({
        product_id: product.id,
        product_option_id: option.id,
        add: [existing?.id ?? { value: bulk.title }],
      })
    }
    await createProductVariantsWorkflow(container).run({
      input: {
        product_variants: [
          {
            product_id: product.id,
            title: bulk.title,
            sku: bulk.sku,
            manage_inventory: false,
            options: option ? { [option.title]: bulk.title } : {},
            prices: [{ currency_code: 'eur', amount: bulk.price }],
          },
        ],
      },
    })
    logger.info(`Aggiunta la riga sfusa ${bulk.sku}.`)
  }

  const variantIds = rows.flatMap((row) => row.variants.map((variant) => variant.id))
  await products.updateProductVariants({ id: variantIds }, { manage_inventory: false })

  const magazzino: MagazzinoModuleService = container.resolve(MAGAZZINO_MODULE)
  if ((await magazzino.listStockCounts({})).length > 0) {
    logger.info('Magazzino già impostato: quantità lasciate come sono.')
    return
  }
  const inventory = container.resolve(Modules.INVENTORY)
  const items = await inventory.listInventoryItems({ sku: FORMATS.map((format) => format.sku) })
  const levels = items.length ? await inventory.listInventoryLevels({ inventory_item_id: items.map((item) => item.id) }) : []
  for (const item of items) {
    const pieces = levels
      .filter((level) => level.inventory_item_id === item.id)
      .reduce((sum, level) => sum + MathBN.convert(level.stocked_quantity).toNumber(), 0)
    if (item.sku && pieces > 0) await magazzino.setCount(item.sku, pieces, 'migrazione')
  }
  logger.info('Magazzino in litri e chili pronto: i pezzi già caricati sono diventati pezzi pronti, lo sfuso parte da zero.')
}
