import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

// Solo sviluppo e test end-to-end: mette una giacenza di prova su ogni formato in ogni sede, così
// carrello e checkout si possono provare. Le giacenze vere si caricano dal back office.
const DEV_QUANTITY = 50

export default async function devStock({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-stock è solo per lo sviluppo: in produzione le giacenze si caricano dal back office.')
  }

  const inventory = container.resolve(Modules.INVENTORY)
  const locations = await container.resolve(Modules.STOCK_LOCATION).listStockLocations({})
  const items = await inventory.listInventoryItems({})
  const levels = await inventory.listInventoryLevels({ inventory_item_id: items.map((item) => item.id) })

  const existing = new Set(levels.map((level) => `${level.inventory_item_id}:${level.location_id}`))
  const pairs = items.flatMap((item) => locations.map((location) => ({ inventory_item_id: item.id, location_id: location.id })))
  const toCreate = pairs.filter((pair) => !existing.has(`${pair.inventory_item_id}:${pair.location_id}`))
  const toUpdate = pairs.filter((pair) => existing.has(`${pair.inventory_item_id}:${pair.location_id}`))

  if (toCreate.length > 0) {
    await inventory.createInventoryLevels(toCreate.map((pair) => ({ ...pair, stocked_quantity: DEV_QUANTITY })))
  }
  if (toUpdate.length > 0) {
    await inventory.updateInventoryLevels(toUpdate.map((pair) => ({ ...pair, stocked_quantity: DEV_QUANTITY })))
  }
  logger.info(`Giacenza di prova: ${DEV_QUANTITY} pezzi per ${items.length} formati in ${locations.length} sedi.`)
}
