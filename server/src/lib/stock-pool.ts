import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MathBN, Modules } from '@medusajs/framework/utils'
import { planConsolidation, type PoolLevel } from './stock-pool-rules'

/**
 * Magazzino principale: la sede con la spedizione (Roseto, nel seed), altrimenti la prima sede.
 * La merce vendibile sta lì; i ritiri nelle altre sedi restano possibili.
 */
export async function mainStockLocationId(container: MedusaContainer): Promise<string | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'stock_location', fields: ['id', 'created_at', 'fulfillment_sets.type'] })
  const locations = [...(data as unknown as { id: string; created_at: string | Date; fulfillment_sets: { type: string }[] | null }[])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
  return (locations.find((location) => location.fulfillment_sets?.some((set) => set.type === 'shipping')) ?? locations[0])?.id ?? null
}

/**
 * Sposta nel magazzino principale la merce libera delle altre sedi (stock-pool-rules). Senza
 * articoli indicati li controlla tutti. Restituisce i pezzi spostati.
 */
export async function consolidateStock(container: MedusaContainer, inventoryItemIds?: string[]): Promise<number> {
  const mainId = await mainStockLocationId(container)
  if (!mainId) return 0
  const inventory = container.resolve(Modules.INVENTORY)
  const levels = await inventory.listInventoryLevels(inventoryItemIds ? { inventory_item_id: inventoryItemIds } : {})

  const byItem = new Map<string, PoolLevel[]>()
  for (const level of levels) {
    const list = byItem.get(level.inventory_item_id) ?? []
    byItem.set(level.inventory_item_id, [
      ...list,
      {
        location_id: level.location_id,
        stocked_quantity: MathBN.convert(level.stocked_quantity).toNumber(),
        reserved_quantity: MathBN.convert(level.reserved_quantity).toNumber(),
      },
    ])
  }

  let moved = 0
  for (const [itemId, itemLevels] of byItem) {
    const plan = planConsolidation(itemLevels, mainId)
    if (plan.moved === 0) continue
    const main = plan.updates.find((update) => update.location_id === mainId)!
    const others = plan.updates.filter((update) => update.location_id !== mainId)
    // Prima si toglie dalle altre sedi, poi si aggiunge al magazzino: il totale non cresce mai.
    await inventory.updateInventoryLevels(others.map((update) => ({ inventory_item_id: itemId, ...update })))
    if (plan.createMain) {
      await inventory.createInventoryLevels([{ inventory_item_id: itemId, location_id: mainId, stocked_quantity: main.stocked_quantity }])
    } else {
      await inventory.updateInventoryLevels([{ inventory_item_id: itemId, ...main }])
    }
    moved += plan.moved
  }
  return moved
}
