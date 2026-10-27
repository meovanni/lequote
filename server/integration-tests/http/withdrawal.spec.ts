import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { Modules } from '@medusajs/framework/utils'
import { RECESSO_MODULE } from '../../src/modules/recesso'
import type RecessoModuleService from '../../src/modules/recesso/service'
import { isPickup, readyCart, seedShop } from '../helpers/shop'
import { orderCode } from '../../src/lib/order-code'

jest.setTimeout(180 * 1000)

// Funzione di recesso (art. 54-bis Cod. Consumo): dichiarazione registrata, ricevuta al cliente,
// avviso ai titolari. Il limite di invii è per processo: l'ultimo test lo esaurisce.
medusaIntegrationTestRunner({
  inApp: true,
  env: { ORDER_ALERT_EMAIL: 'titolari@test.local' },
  testSuite: ({ api, getContainer }) => {
    let store: { headers: Record<string, string> }
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }
    const recesso = () => getContainer().resolve<RecessoModuleService>(RECESSO_MODULE)

    beforeEach(async () => {
      store = await seedShop(getContainer())
    })

    it('registra il recesso, riconosce l’ordine e manda la ricevuta con il contenuto', async () => {
      const cartId = await readyCart(api, store, isPickup, 'pp_bonifico_lequote')
      const { data: placed } = await api.post(`/store/carts/${cartId}/complete`, {}, store)

      const response = await api.post(
        '/store/withdrawals',
        { name: 'Anna Di Marco', email: 'ANNA@example.com', order_reference: `n. ${orderCode(placed.order.display_id, placed.order.created_at).toLowerCase()}`, details: 'Tutto', locale: 'de' },
        store,
      )
      expect(response.status).toBe(201)

      const [saved] = await recesso().listWithdrawals({})
      expect(saved.order_id).toBe(placed.order.id)
      expect(saved.locale).toBe('de')

      const sent = await getContainer().resolve(Modules.NOTIFICATION).listNotifications({ template: ['withdrawal-receipt', 'withdrawal-alert'] })
      expect(sent.map((notification) => notification.to).sort()).toEqual(['ANNA@example.com', 'titolari@test.local'])
    })

    it('accetta il recesso anche se l’ordine non si riconosce, lasciandolo da verificare', async () => {
      await api.post('/store/withdrawals', { name: 'Marco', email: 'marco@example.com', order_reference: 'quello di settembre' }, store)
      const [saved] = await recesso().listWithdrawals({})
      expect(saved.order_id).toBeNull()
    })

    it('ignora in silenzio chi compila il campo trappola e rifiuta dati non validi', async () => {
      const bot = await api.post('/store/withdrawals', { name: 'x', email: 'x@example.com', order_reference: '1', website: 'http://spam' }, store)
      expect(bot.status).toBe(201)
      expect(await recesso().listWithdrawals({})).toHaveLength(0)

      const invalid = await api.post('/store/withdrawals', { name: 'Anna', email: 'non-una-email', order_reference: '1' }, store).catch(fail)
      expect(invalid.status).toBe(400)
    })

    it('frena chi invia troppe dichiarazioni dallo stesso indirizzo', async () => {
      const statuses: number[] = []
      for (let i = 0; i < 6; i++) {
        const response = await api
          .post('/store/withdrawals', { name: 'Anna', email: `anna${i}@example.com`, order_reference: '1' }, store)
          .catch(fail)
        statuses.push(response.status)
      }
      expect(statuses).toContain(400)
    })
  },
})
