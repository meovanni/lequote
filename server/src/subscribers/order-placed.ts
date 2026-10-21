import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  PAYMENT_METHODS,
  renderCustomerConfirmation,
  renderOwnerAlert,
  toEmailLocale,
  type OrderEmailData,
} from '../lib/order-emails'

const ORDER_FIELDS = [
  'id',
  'display_id',
  'email',
  'locale',
  'item_total',
  'shipping_total',
  'tax_total',
  'total',
  'items.variant_sku',
  'items.title',
  'items.subtitle',
  'items.quantity',
  'items.total',
  'shipping_methods.name',
  'shipping_address.*',
  'payment_collections.payments.provider_id',
]

interface RawOrder {
  id: string
  display_id: number
  email: string | null
  locale: string | null
  item_total: number
  shipping_total: number
  tax_total: number
  total: number
  items: { variant_sku: string | null; title: string; subtitle: string | null; quantity: number; total: number }[]
  shipping_methods: { name: string }[]
  shipping_address: {
    first_name: string | null
    last_name: string | null
    phone: string | null
    address_1: string | null
    postal_code: string | null
    city: string | null
    province: string | null
  } | null
  payment_collections: { payments: { provider_id: string }[] }[]
}

export function toOrderEmailData(order: RawOrder): OrderEmailData {
  const address = order.shipping_address
  const street = address?.address_1?.trim()
  const place = [address?.postal_code, address?.city, address?.province ? `(${address.province})` : '']
    .filter(Boolean)
    .join(' ')
  return {
    displayId: order.display_id,
    email: order.email ?? '',
    customerName: [address?.first_name, address?.last_name].filter(Boolean).join(' '),
    phone: address?.phone ?? '',
    locale: toEmailLocale(order.locale),
    lines: order.items.map((item) => ({
      sku: item.variant_sku ?? '',
      title: item.title,
      subtitle: item.subtitle ?? '',
      quantity: item.quantity,
      total: Number(item.total),
    })),
    itemTotal: Number(order.item_total),
    shippingTotal: Number(order.shipping_total),
    taxTotal: Number(order.tax_total),
    total: Number(order.total),
    deliveryName: order.shipping_methods[0]?.name ?? '',
    address: street ? [street, place].filter(Boolean).join(', ') : '',
    paymentMethod: PAYMENT_METHODS[order.payment_collections[0]?.payments[0]?.provider_id ?? ''] ?? null,
  }
}

// Ordine dal sito: conferma al cliente e avviso ai titolari (ORDER_ALERT_EMAIL). Un invio fallito
// non annulla l'ordine: resta nel gestionale, l'errore va nel log.
export default async function orderPlaced({ event, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notifications = container.resolve(Modules.NOTIFICATION)

  const { data } = await query.graph({ entity: 'order', fields: ORDER_FIELDS, filters: { id: event.data.id } })
  const order = data[0] as unknown as RawOrder | undefined
  if (!order) {
    logger.warn(`Email d'ordine: ordine ${event.data.id} non trovato.`)
    return
  }
  const emailData = toOrderEmailData(order)
  const alertTo = process.env.ORDER_ALERT_EMAIL
  const adminUrl = `${process.env.ADMIN_PUBLIC_URL ?? 'http://localhost:9000/app'}/orders/${order.id}`

  const sends = [
    order.email
      ? notifications.createNotifications({
          to: order.email,
          channel: 'email',
          template: 'order-confirmation',
          content: renderCustomerConfirmation(emailData),
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
    if (result.status === 'rejected') logger.error(`Email dell'ordine ${order.display_id} non inviata: ${String(result.reason)}`)
  }
}

export const config: SubscriberConfig = { event: 'order.placed' }
