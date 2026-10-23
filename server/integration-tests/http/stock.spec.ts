import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { Modules } from '@medusajs/framework/utils'
import { BANK_TRANSFER_PROVIDER_ID } from '../../src/lib/checkout-rules'
import { ensureRoles } from '../../src/lib/roles'
import { adminWithRoles } from '../helpers/admin'
import { seedShop } from '../helpers/shop'

jest.setTimeout(300 * 1000)

// Giacenze: il limite di un ordine è la disponibilità totale. La merce vendibile sta in un solo
// magazzino (Medusa non divide una riga tra le sedi), quella caricata in un'altra sede ci viene
// spostata da sola. La disponibilità segue ordini, modifiche e annullamenti.
// Giacenze di prova: 50 pezzi per formato in ciascuna delle due sedi, poi riuniti (100).
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }
    let admin: { headers: Record<string, string> }
    let store: { headers: Record<string, string> }

    beforeEach(async () => {
      const container = getContainer()
      store = await seedShop(container)
      await ensureRoles(container)
      admin = await adminWithRoles(container, 'titolare@test.local')
    })

    const variantOf = async (sku: string) =>
      (await api.get('/admin/backoffice/catalog', admin)).data.variants.find((variant: { sku: string }) => variant.sku === sku)
    const order = (variantId: string, quantity: number) =>
      api.post('/admin/backoffice/orders', { customer: { first_name: 'Anna' }, items: [{ variant_id: variantId, quantity }] }, admin)
    const waitFor = async (check: () => Promise<boolean>) => {
      for (let attempt = 0; attempt < 40; attempt++) {
        if (await check()) return true
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
      return false
    }

    it('la merce è tutta in un magazzino: il massimo per ordine è il totale', async () => {
      const tank = await variantOf('OLIO-5L')
      expect(tank.stock).toBe(100)
      expect(tank.available).toBe(100)
      expect(Object.values(tank.stockByLocation as Record<string, number>).sort((a, b) => a - b)).toEqual([0, 100])
    })

    it('si ordina fino alla disponibilità totale, con un messaggio chiaro oltre', async () => {
      const tank = await variantOf('OLIO-5L')
      expect((await order(tank.variantId, 60)).status).toBe(201)
      expect((await variantOf('OLIO-5L')).available).toBe(40)

      const tooMany = await order(tank.variantId, 41).catch(fail)
      expect(tooMany.status).toBe(400)
      expect(tooMany.data.message).toBe('Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 41, disponibili 40).')

      expect((await order(tank.variantId, 40)).status).toBe(201)
      const soldOut = await order(tank.variantId, 1).catch(fail)
      expect(soldOut.data.message).toBe('Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 1, esaurito).')
    })

    it('modifiche e annullamento tengono allineata la disponibilità', async () => {
      const tank = await variantOf('OLIO-5L')
      const honey = await variantOf('MIELE-500G')
      const available = async (sku = 'OLIO-5L') => (await variantOf(sku)).available

      const id = (await order(tank.variantId, 10)).data.order_id
      expect(await available()).toBe(90)

      // L'ordine tiene già 10 pezzi: può salire fino a 10 + 90.
      const raise = await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 101 }] }, admin).catch(fail)
      expect(raise.status).toBe(400)
      expect(raise.data.message).toBe('Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 101, disponibili 100).')
      expect(await available()).toBe(90)

      await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 100 }] }, admin)
      expect(await available()).toBe(0)

      const added = await api
        .post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 100 }, { variant_id: honey.variantId, quantity: 101 }] }, admin)
        .catch(fail)
      expect(added.status).toBe(400)
      expect(added.data.message).toBe('Disponibilità insufficiente: Miele, Vasetto 500 g (richiesti 101, disponibili 100).')

      await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 4 }] }, admin)
      expect(await available()).toBe(96)

      await api.post(`/admin/orders/${id}/cancel`, {}, admin)
      expect(await available()).toBe(100)
    })

    it('la merce caricata in un’altra sede finisce da sola nel magazzino', async () => {
      const tank = await variantOf('OLIO-5L')
      const [cerchioId] = Object.entries(tank.stockByLocation as Record<string, number>).find(([, quantity]) => quantity === 0)!
      const { data } = await getContainer().resolve('query').graph({ entity: 'product_variant', fields: ['inventory_items.inventory_item_id'], filters: { id: tank.variantId } })
      const itemId = (data[0] as { inventory_items: { inventory_item_id: string }[] }).inventory_items[0].inventory_item_id
      // Come chi carica 20 latte a Cerchio dall'Inventario di Medusa.
      await getContainer().resolve(Modules.INVENTORY).updateInventoryLevels([{ inventory_item_id: itemId, location_id: cerchioId, stocked_quantity: 20 }])

      const moved = await waitFor(async () => {
        const variant = await variantOf('OLIO-5L')
        return variant.available === 120 && variant.stockByLocation[cerchioId] === 0
      })
      expect(moved).toBe(true)
    })

    it('anche dal sito si ordina più di quanto c’è in una sola sede di partenza', async () => {
      const { data: regions } = await api.get('/store/regions', store)
      const tank = await variantOf('OLIO-5L')
      const { data: created } = await api.post('/store/carts', { region_id: regions.regions[0].id }, store)
      const cartId = created.cart.id as string
      await api.post(`/store/carts/${cartId}/line-items`, { variant_id: tank.variantId, quantity: 60 }, store)
      const address = { first_name: 'Anna', last_name: 'Di Marco', address_1: 'Via Roma 1', city: 'Teramo', postal_code: '64100', country_code: 'it', phone: '3330000000' }
      await api.post(`/store/carts/${cartId}`, { email: 'anna@example.com', shipping_address: address, billing_address: address }, store)
      const { data: options } = await api.get(`/store/shipping-options?cart_id=${cartId}`, store)
      const pickup = options.shipping_options.find((option: { name: string }) => option.name === 'Ritiro a Cerchio')
      await api.post(`/store/carts/${cartId}/shipping-methods`, { option_id: pickup.id }, store)
      const { data: collection } = await api.post('/store/payment-collections', { cart_id: cartId }, store)
      await api.post(`/store/payment-collections/${collection.payment_collection.id}/payment-sessions`, { provider_id: BANK_TRANSFER_PROVIDER_ID }, store)
      const { data: completed } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      expect(completed.type).toBe('order')
      expect((await variantOf('OLIO-5L')).available).toBe(40)
    })

    it('l’import da Excel riporta in italiano le righe senza disponibilità', async () => {
      const tank = await variantOf('OLIO-5L')
      const { data } = await api.post(
        '/admin/backoffice/order-imports',
        { variant_id: tank.variantId, rows: [{ line: 2, name: 'Anna', tanks: 40 }, { line: 3, name: 'Ferri', tanks: 40 }, { line: 4, name: 'Rossi', tanks: 40 }] },
        admin,
      )
      expect(data.results).toEqual([
        expect.objectContaining({ line: 2, ok: true }),
        expect.objectContaining({ line: 3, ok: true }),
        expect.objectContaining({ line: 4, ok: false, error: 'Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 40, disponibili 20).' }),
      ])
    })
  },
})
