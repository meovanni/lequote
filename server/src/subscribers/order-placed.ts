import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { bankTransferDetails, renderCustomerConfirmation, renderOwnerAlert } from '../lib/order-emails'
import { CONTENUTI_MODULE } from '../modules/contenuti'
import type ContenutiModuleService from '../modules/contenuti/service'
import { adminOrderUrl, loadOrderEmailData } from '../lib/order-email-data'

// Ordine dal sito: conferma al cliente e avviso ai titolari (ORDER_ALERT_EMAIL). Un invio fallito
// non annulla l'ordine: resta nel gestionale, l'errore va nel log.
export default async function orderPlaced({ event, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notifications = container.resolve(Modules.NOTIFICATION)

  const emailData = await loadOrderEmailData(container, event.data.id)
  if (!emailData) {
    logger.warn(`Email d'ordine: ordine ${event.data.id} non trovato.`)
    return
  }
  const order = { id: event.data.id, code: emailData.code, email: emailData.email }
  const alertTo = process.env.ORDER_ALERT_EMAIL
  // IBAN e intestatario come sono pubblicati sul sito (Contenuti › Dati aziendali).
  const bank = bankTransferDetails(await container.resolve<ContenutiModuleService>(CONTENUTI_MODULE).publishedShared())
  const adminUrl = adminOrderUrl(order.id)

  const sends = [
    order.email
      ? notifications.createNotifications({
          to: order.email,
          channel: 'email',
          template: 'order-confirmation',
          content: renderCustomerConfirmation(emailData, bank),
          ...(alertTo && { provider_data: { replyTo: alertTo } }),
        })
      : Promise.resolve(),
    alertTo
      ? notifications.createNotifications({
          to: alertTo,
          channel: 'email',
          template: 'order-alert',
          content: renderOwnerAlert(emailData, adminUrl),
          provider_data: order.email ? { replyTo: order.email } : undefined,
        })
      : Promise.resolve(),
  ]
  if (!alertTo) logger.warn('ORDER_ALERT_EMAIL non impostata: nessun avviso ai titolari per i nuovi ordini.')

  const results = await Promise.allSettled(sends)
  for (const result of results) {
    if (result.status === 'rejected') logger.error(`Email dell'ordine ${order.code} non inviata: ${String(result.reason)}`)
  }
}

export const config: SubscriberConfig = { event: 'order.placed' }
