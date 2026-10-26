import type { MedusaContainer } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import seed from '../../src/scripts/seed'
import devStock from '../../src/scripts/dev-stock'

type Api = {
  get: (url: string, config?: object) => Promise<{ data: any }>
  post: (url: string, body?: object, config?: object) => Promise<{ data: any }>
}

/**
 * Negozio come in sviluppo: dati del seed, magazzino di prova e spedizione accesa (nel seed nasce
 * spenta in attesa della tariffa). Restituisce gli header della chiave pubblica della vetrina.
 */
export async function seedShop(container: MedusaContainer): Promise<{ headers: Record<string, string> }> {
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  // In sviluppo il profilo predefinito lo crea "medusa db:migrate"; il database di test parte vuoto.
  await fulfillment.createShippingProfiles({ name: 'Default Shipping Profile', type: 'default' })
  await seed({ container, args: [] })
  await devStock({ container, args: [] })

  const [shipping] = await fulfillment.listShippingOptions({ name: 'Spedizione in Italia' }, { relations: ['rules'] })
  await fulfillment.updateShippingOptions(shipping.id, {
    rules: shipping.rules.map((rule) => (rule.attribute === 'enabled_in_store' ? { id: rule.id, value: 'true' } : { id: rule.id })),
  })

  // La chiave del seed, collegata al canale della vetrina (il test runner ne crea un'altra).
  const [key] = await container.resolve(Modules.API_KEY).listApiKeys({ type: 'publishable', title: 'Vetrina' })
  return { headers: { 'x-publishable-api-key': key.token } }
}

/** Carrello pronto da chiudere: un prodotto, dati del cliente, consegna e pagamento scelti. */
export async function readyCart(
  api: Api,
  store: { headers: Record<string, string> },
  optionName: (name: string) => boolean,
  provider: string,
): Promise<string> {
  const { data: regions } = await api.get('/store/regions', store)
  const { data: products } = await api.get('/store/products?fields=variants.id,variants.sku', store)
  // Un formato confezionato: lo sfuso "da imbottigliare" non si vende dal sito.
  const variant = products.products[0].variants.find((entry: { sku: string }) => !entry.sku.endsWith('-SFUSO'))
  const { data: created } = await api.post('/store/carts', { region_id: regions.regions[0].id }, store)
  const cartId = created.cart.id as string

  await api.post(`/store/carts/${cartId}/line-items`, { variant_id: variant.id, quantity: 1 }, store)
  const address = { first_name: 'Anna', last_name: 'Di Marco', address_1: 'Via Roma 1', city: 'Teramo', postal_code: '64100', country_code: 'it', phone: '3330000000' }
  await api.post(`/store/carts/${cartId}`, { email: 'anna@example.com', shipping_address: address, billing_address: address }, store)

  const { data: options } = await api.get(`/store/shipping-options?cart_id=${cartId}`, store)
  const option = options.shipping_options.find((candidate: { name: string }) => optionName(candidate.name))
  await api.post(`/store/carts/${cartId}/shipping-methods`, { option_id: option.id }, store)

  const { data: collection } = await api.post('/store/payment-collections', { cart_id: cartId }, store)
  await api.post(`/store/payment-collections/${collection.payment_collection.id}/payment-sessions`, { provider_id: provider }, store)
  return cartId
}

export const isShipping = (name: string) => name === 'Spedizione in Italia'
export const isPickup = (name: string) => name.startsWith('Ritiro a ')
