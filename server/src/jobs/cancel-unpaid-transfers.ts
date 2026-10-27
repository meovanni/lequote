import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { cancelOrderWorkflow } from '@medusajs/medusa/core-flows'
import { renderCustomerCancellation, renderOwnerCancellation } from '../lib/cancellation-emails'
import { cutoffDate, retentionDays, unpaidTransfersToCancel, type OrderForPaymentCheck } from '../lib/housekeeping'
import { adminOrderUrl, loadOrderEmailData } from '../lib/order-email-data'

// Ordini dal sito con bonifico non arrivato entro BANK_TRANSFER_DAYS giorni (predefinito 7, come
// nelle condizioni di vendita): si annullano, la merce torna disponibile, cliente e titolari
// ricevono un'email. Le prenotazioni di agenti e back office sono escluse (lib/housekeeping.ts).
export default async function cancelUnpaidTransfers(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const days = retentionDays(process.env.BANK_TRANSFER_DAYS, 7)
  const cutoff = cutoffDate(new Date(), days)

  const { data } = await query.graph({
    entity: 'order',
    fields: ['id', 'status', 'created_at', 'metadata', 'payment_collections.status', 'payment_collections.payments.provider_id', 'payment_collections.payments.captured_at'],
    filters: { status: { $nin: ['canceled', 'completed', 'draft'] }, created_at: { $lt: cutoff } },
  })
  const ids = unpaidTransfersToCancel(data as unknown as OrderForPaymentCheck[], cutoff)

  for (const id of ids) {
    try {
      await cancelOrderWorkflow(container).run({ input: { order_id: id } })
    } catch (error) {
      logger.error(`Annullamento dell'ordine ${id} per bonifico non ricevuto fallito: ${String(error)}`)
      continue
    }
    await notifyCancellation(container, id, days)
  }
  if (ids.length > 0) logger.info(`Ordini annullati per bonifico non ricevuto entro ${days} giorni: ${ids.length}.`)
}

async function notifyCancellation(container: MedusaContainer, id: string, days: number) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notifications = container.resolve(Modules.NOTIFICATION)
  const order = await loadOrderEmailData(container, id)
  if (!order) return

  const alertTo = process.env.ORDER_ALERT_EMAIL
  const sends = [
    order.email
      ? notifications.createNotifications({
          to: order.email,
          channel: 'email',
          template: 'order-cancelled-unpaid',
          content: renderCustomerCancellation(order, days),
          ...(alertTo && { provider_data: { replyTo: alertTo } }),
        })
      : Promise.resolve(),
    alertTo
      ? notifications.createNotifications({
          to: alertTo,
          channel: 'email',
          template: 'order-cancelled-unpaid-alert',
          content: renderOwnerCancellation(order, days, adminOrderUrl(id)),
          provider_data: order.email ? { replyTo: order.email } : undefined,
        })
      : Promise.resolve(),
  ]
  const results = await Promise.allSettled(sends)
  for (const result of results) {
    if (result.status === 'rejected') logger.error(`Email di annullamento dell'ordine ${order.code} non inviata: ${String(result.reason)}`)
  }
}

export const config = { name: 'cancel-unpaid-transfers', schedule: '30 3 * * *' }
