import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { Modules } from '@medusajs/framework/utils'
import seed from '../../src/scripts/seed'
import devStock from '../../src/scripts/dev-stock'

jest.setTimeout(180 * 1000)

// Chiusura del carrello con i dati del seed: il pagamento al ritiro vale solo con il ritiro,
// anche se la richiesta arriva alle API senza passare dalla vetrina.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let store: { headers: Record<string, string> }
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }

    beforeEach(async () => {
      const container = getContainer()
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      // In sviluppo il profilo predefinito lo crea "medusa db:migrate"; il database di test parte vuoto.
      await fulfillment.createShippingProfiles({ name: 'Default Shipping Profile', type: 'default' })
      await seed({ container, args: [] })
      await devStock({ container, args: [] })

      // La spedizione nasce spenta in attesa della tariffa: qui la si accende per poterla scegliere.
      const [shipping] = await fulfillment.listShippingOptions({ name: 'Spedizione in Italia' }, { relations: ['rules'] })
      await fulfillment.updateShippingOptions(shipping.id, {
        rules: shipping.rules.map((rule) =>
          rule.attribute === 'enabled_in_store' ? { id: rule.id, value: 'true' } : { id: rule.id },
        ),
      })

      // La chiave del seed, collegata al canale della vetrina (il test runner ne crea un'altra).
      const [key] = await container.resolve(Modules.API_KEY).listApiKeys({ type: 'publishable', title: 'Vetrina' })
      store = { headers: { 'x-publishable-api-key': key.token } }
    })

    async function cartWith(optionName: (name: string) => boolean, provider: string) {
      const { data: regions } = await api.get('/store/regions', store)
      const { data: products } = await api.get('/store/products?fields=variants.id', store)
      const { data: created } = await api.post('/store/carts', { region_id: regions.regions[0].id }, store)
      const cartId = created.cart.id as string

      await api.post(`/store/carts/${cartId}/line-items`, { variant_id: products.products[0].variants[0].id, quantity: 1 }, store)
      const address = { first_name: 'Anna', last_name: 'Di Marco', address_1: 'Via Roma 1', city: 'Teramo', postal_code: '64100', country_code: 'it', phone: '3330000000' }
      await api.post(`/store/carts/${cartId}`, { email: 'anna@example.com', shipping_address: address, billing_address: address }, store)

      const { data: options } = await api.get(`/store/shipping-options?cart_id=${cartId}`, store)
      const option = options.shipping_options.find((candidate: { name: string }) => optionName(candidate.name))
      await api.post(`/store/carts/${cartId}/shipping-methods`, { option_id: option.id }, store)

      const { data: collection } = await api.post('/store/payment-collections', { cart_id: cartId }, store)
      await api.post(`/store/payment-collections/${collection.payment_collection.id}/payment-sessions`, { provider_id: provider }, store)
      return cartId
    }

    it('rifiuta il pagamento al ritiro con la spedizione', async () => {
      const cartId = await cartWith((name) => name === 'Spedizione in Italia', 'pp_ritiro_lequote')
      const response = await api.post(`/store/carts/${cartId}/complete`, {}, store).catch(fail)
      expect(response.status).toBe(400)
      expect(response.data.message).toMatch(/solo con il ritiro/)
    })

    it('accetta il pagamento al ritiro con il ritiro in sede', async () => {
      const cartId = await cartWith((name) => name.startsWith('Ritiro a '), 'pp_ritiro_lequote')
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      expect(data.type).toBe('order')
    })

    it('accetta il bonifico con la spedizione', async () => {
      const cartId = await cartWith((name) => name === 'Spedizione in Italia', 'pp_bonifico_lequote')
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      expect(data.type).toBe('order')
    })
  },
})
