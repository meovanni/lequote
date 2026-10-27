import { storeFetch } from './client'
import { getRegionId } from './catalog'
import { orderCode } from '@/lib/orderCode'

// Carrello e checkout ospite sulla Store API di Medusa. Gli importi arrivano in euro, IVA inclusa.

export type PaymentMethod = 'bonifico' | 'ritiro'

export const PAYMENT_PROVIDERS: Record<PaymentMethod, string> = {
  bonifico: 'pp_bonifico_lequote',
  ritiro: 'pp_ritiro_lequote',
}

export interface CartLine {
  id: string
  variantId: string
  sku: string
  productHandle: string
  /** Titoli del back office, in italiano: la vetrina li traduce per SKU quando può. */
  title: string
  subtitle: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Cart {
  id: string
  email: string
  lines: CartLine[]
  itemCount: number
  itemTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  shippingOptionId: string | null
  paymentCollectionId: string | null
  /** Un carrello già trasformato in ordine non si usa più. */
  completed: boolean
}

export interface ShippingChoice {
  id: string
  kind: 'pickup' | 'delivery'
  name: string
  /** Comune della sede, per i ritiri. */
  city: string
  amount: number
}

export interface Address {
  first_name: string
  last_name: string
  phone: string
  address_1?: string
  postal_code?: string
  city?: string
  province?: string
}

export interface OrderSummary {
  id: string
  /** Codice d'ordine per il cliente, es. H3E5C26 (lib/orderCode.ts). */
  code: string
  email: string
  lines: CartLine[]
  itemTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  shippingName: string
  paymentMethod: PaymentMethod | null
}

interface RawLine {
  id: string
  variant_id?: string | null
  variant_sku?: string | null
  product_handle?: string | null
  title?: string | null
  subtitle?: string | null
  quantity: number
  unit_price: number
  total?: number | null
}

interface RawCart {
  id: string
  email?: string | null
  completed_at?: string | null
  items?: RawLine[] | null
  item_total?: number | null
  shipping_total?: number | null
  tax_total?: number | null
  total?: number | null
  shipping_methods?: { shipping_option_id?: string | null }[] | null
  payment_collection?: { id: string } | null
}

interface RawShippingOption {
  id: string
  name: string
  amount?: number | null
  type?: { code?: string | null } | null
  service_zone?: {
    fulfillment_set?: {
      location?: { address?: { city?: string | null } | null } | null
    } | null
  } | null
}

interface RawOrder extends Omit<RawCart, 'shipping_methods' | 'payment_collection'> {
  display_id: number
  created_at: string
  shipping_methods?: { name?: string | null }[] | null
  payment_collections?: { payments?: { provider_id?: string | null }[] | null }[] | null
}

function toLine(raw: RawLine): CartLine {
  return {
    id: raw.id,
    variantId: raw.variant_id ?? '',
    sku: raw.variant_sku ?? '',
    productHandle: raw.product_handle ?? '',
    title: raw.title ?? '',
    subtitle: raw.subtitle ?? '',
    quantity: raw.quantity,
    unitPrice: raw.unit_price,
    total: raw.total ?? raw.unit_price * raw.quantity,
  }
}

export function toCart(raw: RawCart): Cart {
  const lines = (raw.items ?? []).map(toLine)
  return {
    id: raw.id,
    email: raw.email ?? '',
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    itemTotal: raw.item_total ?? 0,
    shippingTotal: raw.shipping_total ?? 0,
    taxTotal: raw.tax_total ?? 0,
    total: raw.total ?? 0,
    shippingOptionId: raw.shipping_methods?.[0]?.shipping_option_id ?? null,
    paymentCollectionId: raw.payment_collection?.id ?? null,
    completed: Boolean(raw.completed_at),
  }
}

/** Le opzioni di ritiro hanno codice "ritiro-…" (seed del back end); le altre sono spedizioni. */
export function toShippingChoice(raw: RawShippingOption): ShippingChoice {
  const pickup = raw.type?.code?.startsWith('ritiro') ?? false
  return {
    id: raw.id,
    kind: pickup ? 'pickup' : 'delivery',
    name: raw.name,
    city: raw.service_zone?.fulfillment_set?.location?.address?.city ?? '',
    amount: raw.amount ?? 0,
  }
}

export function toPaymentMethod(providerId: string | null | undefined): PaymentMethod | null {
  const entry = Object.entries(PAYMENT_PROVIDERS).find(([, id]) => id === providerId)
  return entry ? (entry[0] as PaymentMethod) : null
}

export function toOrderSummary(raw: RawOrder): OrderSummary {
  const base = toCart({
    ...raw,
    shipping_methods: null,
    payment_collection: null,
  })
  const providerId = raw.payment_collections?.[0]?.payments?.[0]?.provider_id
  return {
    id: raw.id,
    code: orderCode(raw.display_id, raw.created_at),
    email: base.email,
    lines: base.lines,
    itemTotal: base.itemTotal,
    shippingTotal: base.shippingTotal,
    taxTotal: base.taxTotal,
    total: base.total,
    shippingName: raw.shipping_methods?.[0]?.name ?? '',
    paymentMethod: toPaymentMethod(providerId),
  }
}

const CART_FIELDS = [
  'id',
  'email',
  'completed_at',
  'item_total',
  'shipping_total',
  'tax_total',
  'total',
  '*items',
  'shipping_methods.shipping_option_id',
  'payment_collection.id',
].join(',')

const ORDER_FIELDS = [
  'id',
  'display_id',
  'created_at',
  'email',
  'item_total',
  'shipping_total',
  'tax_total',
  'total',
  '*items',
  'shipping_methods.name',
  '*payment_collections.payments',
].join(',')

type CartResponse = { cart: RawCart }

const withFields = (path: string) => `${path}?fields=${encodeURIComponent(CART_FIELDS)}`
const post = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
})

/** locale: lingua del sito, ricopiata sull'ordine per scrivere l'email di conferma nella stessa lingua. */
export async function createCart(locale: string): Promise<Cart> {
  const region_id = await getRegionId()
  const { cart } = await storeFetch<CartResponse>(withFields('/store/carts'), post({ region_id, locale }))
  return toCart(cart)
}

export async function retrieveCart(id: string): Promise<Cart> {
  const { cart } = await storeFetch<CartResponse>(withFields(`/store/carts/${id}`))
  return toCart(cart)
}

export async function addLine(cartId: string, variantId: string, quantity: number): Promise<Cart> {
  const { cart } = await storeFetch<CartResponse>(
    withFields(`/store/carts/${cartId}/line-items`),
    post({ variant_id: variantId, quantity }),
  )
  return toCart(cart)
}

export async function updateLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const { cart } = await storeFetch<CartResponse>(
    withFields(`/store/carts/${cartId}/line-items/${lineId}`),
    post({ quantity }),
  )
  return toCart(cart)
}

export async function removeLine(cartId: string, lineId: string): Promise<Cart> {
  // La cancellazione risponde con il carrello aggiornato sotto "parent".
  const { parent } = await storeFetch<{ parent: RawCart }>(withFields(`/store/carts/${cartId}/line-items/${lineId}`), {
    method: 'DELETE',
  })
  return toCart(parent)
}

/** Si spedisce solo in Italia (ADR): il paese è fisso. Indirizzo di fatturazione uguale. */
export async function updateCustomer(cartId: string, email: string, address: Address, locale: string): Promise<Cart> {
  const full = { ...address, country_code: 'it' }
  const { cart } = await storeFetch<CartResponse>(
    withFields(`/store/carts/${cartId}`),
    post({ email, locale, shipping_address: full, billing_address: full }),
  )
  return toCart(cart)
}

export async function listShippingChoices(cartId: string): Promise<ShippingChoice[]> {
  const { shipping_options } = await storeFetch<{
    shipping_options: RawShippingOption[]
  }>(`/store/shipping-options?cart_id=${cartId}`)
  return shipping_options.map(toShippingChoice)
}

export async function setShippingChoice(cartId: string, optionId: string): Promise<Cart> {
  const { cart } = await storeFetch<CartResponse>(
    withFields(`/store/carts/${cartId}/shipping-methods`),
    post({ option_id: optionId }),
  )
  return toCart(cart)
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CheckoutError'
  }
}

/** Avvia il pagamento scelto e chiude il carrello: restituisce l'id dell'ordine creato. */
export async function placeOrder(cart: Cart, method: PaymentMethod): Promise<string> {
  const collectionId =
    cart.paymentCollectionId ??
    (await storeFetch<{ payment_collection: { id: string } }>('/store/payment-collections', post({ cart_id: cart.id })))
      .payment_collection.id
  await storeFetch(
    `/store/payment-collections/${collectionId}/payment-sessions`,
    post({ provider_id: PAYMENT_PROVIDERS[method] }),
  )

  const result = await storeFetch<
    { type: 'order'; order: { id: string } } | { type: 'cart'; error?: { message?: string } }
  >(`/store/carts/${cart.id}/complete`, post({}))
  if (result.type !== 'order') throw new CheckoutError(result.error?.message ?? 'Ordine non completato.')
  return result.order.id
}

export async function retrieveOrder(id: string): Promise<OrderSummary> {
  const { order } = await storeFetch<{ order: RawOrder }>(
    `/store/orders/${id}?fields=${encodeURIComponent(ORDER_FIELDS)}`,
  )
  return toOrderSummary(order)
}
