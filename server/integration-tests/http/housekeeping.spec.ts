import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import deleteAbandonedCarts from '../../src/jobs/delete-abandoned-carts'
import cancelUnpaidTransfers from '../../src/jobs/cancel-unpaid-transfers'
import { isPickup, readyCart, seedShop } from '../helpers/shop'

jest.setTimeout(180 * 1000)

const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(Date.now() - days * DAY)

// Lavori notturni su dati veri: le date si spostano indietro direttamente nel database.
medusaIntegrationTestRunner({
  inApp: true,
  env: { ORDER_ALERT_EMAIL: 'titolari@test.local' },
  testSuite: ({ api, getContainer }) => {
    let store: { headers: Record<string, string> }

    beforeEach(async () => {
      store = await seedShop(getContainer())
    })

    const db = () => getContainer().resolve(ContainerRegistrationKeys.PG_CONNECTION)

    it('cancella i carrelli abbandonati da più di 5 giorni e tiene quelli recenti', async () => {
      const { data: regions } = await api.get('/store/regions', store)
      const old = (await api.post('/store/carts', { region_id: regions.regions[0].id }, store)).data.cart.id
      const recent = (await api.post('/store/carts', { region_id: regions.regions[0].id }, store)).data.cart.id
      await db()('cart').where({ id: old }).update({ updated_at: daysAgo(6) })
      await db()('cart').where({ id: recent }).update({ updated_at: daysAgo(4) })

      await deleteAbandonedCarts(getContainer())

      const remaining = await getContainer().resolve(Modules.CART).listCarts({ id: [old, recent] })
      expect(remaining.map((cart) => cart.id)).toEqual([recent])
    })

    it('annulla un ordine con bonifico non pagato dopo 7 giorni e avvisa cliente e titolari', async () => {
      const cartId = await readyCart(api, store, isPickup, 'pp_bonifico_lequote')
      const { data: late } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      const freshCart = await readyCart(api, store, isPickup, 'pp_bonifico_lequote')
      const { data: fresh } = await api.post(`/store/carts/${freshCart}/complete`, {}, store)
      await db()('order').where({ id: late.order.id }).update({ created_at: daysAgo(8) })

      await cancelUnpaidTransfers(getContainer())

      const orders = await getContainer().resolve(Modules.ORDER).listOrders({ id: [late.order.id, fresh.order.id] })
      const status = Object.fromEntries(orders.map((order) => [order.id, order.status]))
      expect(status[late.order.id]).toBe('canceled')
      expect(status[fresh.order.id]).not.toBe('canceled')

      const sent = await getContainer().resolve(Modules.NOTIFICATION).listNotifications({ template: ['order-cancelled-unpaid', 'order-cancelled-unpaid-alert'] })
      expect(sent.map((notification) => notification.to).sort()).toEqual(['anna@example.com', 'titolari@test.local'])
    })

    it('non tocca le prenotazioni inserite da un agente', async () => {
      const cartId = await readyCart(api, store, isPickup, 'pp_bonifico_lequote')
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, store)
      await getContainer()
        .resolve(Modules.ORDER)
        .updateOrders(data.order.id, { metadata: { inserted_by: { type: 'agente', id: 'agent_1', name: 'Bruno' } } })
      await db()('order').where({ id: data.order.id }).update({ created_at: daysAgo(30) })

      await cancelUnpaidTransfers(getContainer())

      const [order] = await getContainer().resolve(Modules.ORDER).listOrders({ id: data.order.id })
      expect(order.status).not.toBe('canceled')
    })
  },
})
