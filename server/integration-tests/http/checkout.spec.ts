import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { isPickup, isShipping, readyCart, seedShop } from '../helpers/shop'

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
      store = await seedShop(getContainer())
    })

    it('rifiuta il pagamento al ritiro con la spedizione', async () => {
      const cartId = await readyCart(api, store, isShipping, 'pp_ritiro_lequote')
      const response = await api.post(`/store/carts/${cartId}/complete`, {}, store).catch(fail)
      expect(response.status).toBe(400)
      expect(response.data.message).toMatch(/solo con il ritiro/)
    })

    it('accetta il pagamento al ritiro con il ritiro in sede', async () => {
      const cartId = await readyCart(api, store, isPickup, 'pp_ritiro_lequote')
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      expect(data.type).toBe('order')
    })

    it('accetta il bonifico con la spedizione', async () => {
      const cartId = await readyCart(api, store, isShipping, 'pp_bonifico_lequote')
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      expect(data.type).toBe('order')
    })
  },
})
