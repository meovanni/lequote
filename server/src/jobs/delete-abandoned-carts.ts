import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { cutoffDate, retentionDays } from '../lib/housekeeping'

// Carrelli mai diventati ordine: si cancellano dopo CART_RETENTION_DAYS giorni dall'ultima
// modifica (predefinito 5), come promette l'informativa privacy. I carrelli conclusi restano,
// collegati ai loro ordini.
const BATCH = 200

export default async function deleteAbandonedCarts(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const carts = container.resolve(Modules.CART)
  const days = retentionDays(process.env.CART_RETENTION_DAYS, 5)
  const cutoff = cutoffDate(new Date(), days)

  let deleted = 0
  for (;;) {
    const batch = await carts.listCarts(
      // I filtri del modulo carrello accettano date come stringhe ISO.
      { completed_at: { $eq: null }, updated_at: { $lt: cutoff.toISOString() } } as Parameters<typeof carts.listCarts>[0],
      { select: ['id'], take: BATCH },
    )
    if (batch.length === 0) break
    await carts.deleteCarts(batch.map((cart) => cart.id))
    deleted += batch.length
    if (batch.length < BATCH) break
  }
  if (deleted > 0) logger.info(`Carrelli abbandonati da più di ${days} giorni cancellati: ${deleted}.`)
}

export const config = { name: 'delete-abandoned-carts', schedule: '15 3 * * *' }
