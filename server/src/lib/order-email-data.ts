import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { storefrontUrl } from '../modules/filiera/lib/lot-qr'
import { orderCode } from './order-code'
import { PAYMENT_METHODS, toEmailLocale, type EmailLocale, type OrderEmailData } from './order-emails'

// Dati di un ordine come li usano le email (conferma, avviso ai titolari, annullamento).

const ORDER_FIELDS = [
  'id',
  'display_id',
  'created_at',
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
  'metadata',
]

interface RawOrder {
  id: string
  display_id: number
  created_at: string | Date
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
  metadata: Record<string, unknown> | null
}

export function toOrderEmailData(order: RawOrder): OrderEmailData {
  const address = order.shipping_address
  const street = address?.address_1?.trim()
  const place = [address?.postal_code, address?.city, address?.province ? `(${address.province})` : '']
    .filter(Boolean)
    .join(' ')
  return {
    code: orderCode(order.display_id, order.created_at),
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
    insertedBy: insertedByName(order.metadata),
  }
}

/** Nome di chi ha inserito l'ordine dal gestionale (metadata.inserted_by); null per gli ordini dal sito. */
function insertedByName(metadata: Record<string, unknown> | null): string | null {
  const insertedBy = metadata?.inserted_by as { name?: unknown } | undefined
  return typeof insertedBy?.name === 'string' && insertedBy.name ? insertedBy.name : null
}

export async function loadOrderEmailData(container: MedusaContainer, id: string): Promise<OrderEmailData | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'order', fields: ORDER_FIELDS, filters: { id } })
  const order = data[0] as unknown as RawOrder | undefined
  if (!order) return null
  const emailData = toOrderEmailData(order)
  return { ...emailData, withdrawalUrl: withdrawalUrl(emailData.locale, emailData.code) }
}

const LOCALE_PREFIX: Record<EmailLocale, string> = { it: '', en: '/en', de: '/de' }

/** Pagina del sito con la funzione di recesso già aperta su questo ordine; assente se manca STOREFRONT_URL. */
function withdrawalUrl(locale: EmailLocale, code: string): string | undefined {
  try {
    return `${storefrontUrl()}${LOCALE_PREFIX[locale]}/recesso?ordine=${code}`
  } catch {
    return undefined
  }
}

/** Link all'ordine nel gestionale, per gli avvisi ai titolari. */
export function adminOrderUrl(id: string): string {
  return `${process.env.ADMIN_PUBLIC_URL ?? 'http://localhost:9000/app'}/orders/${id}`
}
