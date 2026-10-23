import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, InventoryEvents, Modules } from '@medusajs/framework/utils'
import { consolidateStock } from '../lib/stock-pool'

/**
 * Merce caricata (o liberata da un annullamento) in una sede che non è il magazzino principale:
 * si sposta subito nel magazzino, così ogni ordine può arrivare alla disponibilità totale.
 * Lo spostamento stesso genera un aggiornamento, che però non trova più nulla da spostare.
 */
export default async function stockPoolHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const level = await container.resolve(Modules.INVENTORY).retrieveInventoryLevel(data.id)
    const moved = await consolidateStock(container, [level.inventory_item_id])
    if (moved > 0) logger.info(`Giacenze: ${moved} pezzi spostati nel magazzino principale.`)
  } catch (error) {
    logger.warn(`Giacenze: spostamento nel magazzino principale non riuscito (${String(error)}).`)
  }
}

export const config: SubscriberConfig = {
  event: [InventoryEvents.INVENTORY_LEVEL_CREATED, InventoryEvents.INVENTORY_LEVEL_UPDATED],
}
