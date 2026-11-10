import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { placeBooking } from '../../src/lib/bookings/create'
import type { Actor, BookingInput } from '../../src/lib/bookings/types'
import { AGENT_ROLE_ID, ensureRoles } from '../../src/lib/roles'
import { VENDITE_MODULE } from '../../src/modules/vendite'
import type VenditeModuleService from '../../src/modules/vendite/service'
import { adminWithRoles } from '../helpers/admin'
import { isPickup, seedShop } from '../helpers/shop'

jest.setTimeout(240 * 1000)

// DDT e fatture su ordini veri: numerazione per anno, un DDT per ordine, fattura differita che
// richiama i DDT, annullamento, permessi degli agenti, PDF e riepilogo per il commercialista.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let owner: { headers: Record<string, string> }
    let input: BookingInput
    let bruno: { id: string }
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }
    const customer = {
      kind: 'azienda',
      name: 'Bottega Rossi srl',
      address: 'Via Roma 1',
      postalCode: '64100',
      city: 'Teramo',
      province: 'TE',
      vat: '01234567890',
      fiscalCode: '',
      sdiCode: 'M5UXCR1',
      pec: '',
      email: '',
      phone: '',
    }

    beforeEach(async () => {
      const container = getContainer()
      const store = await seedShop(container)
      await ensureRoles(container)
      owner = await adminWithRoles(container, 'titolare@test.local')
      const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
      bruno = await vendite.createSalesAgents({ name: 'Bruno', email: 'bruno@test.local' })
      const { data: products } = await api.get('/store/products?fields=handle,variants.id,variants.sku', store)
      const variants = products.products.flatMap((product: { variants: { id: string; sku: string }[] }) => product.variants)
      const olio = variants.find((variant: { sku: string }) => variant.sku === 'OLIO-750ML')
      const { data: regions } = await api.get('/store/regions', store)
      const { data: cart } = await api.post('/store/carts', { region_id: regions.regions[0].id }, store)
      const { data: options } = await api.get(`/store/shipping-options?cart_id=${cart.cart.id}`, store)
      const pickup = options.shipping_options.find((option: { name: string }) => isPickup(option.name))
      input = {
        customer: { kind: 'azienda', first_name: 'Mario', last_name: 'Rossi', company: 'Bottega Rossi srl', vat_number: '01234567890', address_1: 'Via Roma 1', postal_code: '64100', city: 'Teramo', province: 'TE' },
        items: [{ variant_id: olio.id, quantity: 2 }],
        shipping_option_id: pickup.id,
        agent_id: bruno.id,
      }
    })

    const actor: Actor = { type: 'admin', id: 'user_test', name: 'Titolare' }

    it('DDT numerati, uno per ordine, poi una fattura differita che li richiama', async () => {
      const first = await placeBooking(getContainer(), input, actor)
      const second = await placeBooking(getContainer(), input, actor)

      const { data: draft } = await api.get(`/admin/gestione/orders/${first.orderId}/ddt`, owner)
      expect(draft.draft.recipient).toMatchObject({ kind: 'azienda', name: 'Bottega Rossi srl', vat: '01234567890', city: 'Teramo' })
      expect(draft.draft.packages).toBe(2)

      const ddtBody = { recipient: draft.draft.recipient, lots: ['L011026'] }
      const { data: ddt1 } = await api.post(`/admin/gestione/orders/${first.orderId}/ddt`, ddtBody, owner)
      const { data: ddt2 } = await api.post(`/admin/gestione/orders/${second.orderId}/ddt`, ddtBody, owner)
      expect([ddt1.document.number, ddt2.document.number]).toEqual([1, 2])

      const again = await api.post(`/admin/gestione/orders/${first.orderId}/ddt`, ddtBody, owner).catch(fail)
      expect(again.status).toBe(400)
      expect(again.data.message).toMatch(/già il DDT n\. 1/)

      const { data: candidates } = await api.get('/admin/documenti/candidati', owner)
      expect(candidates.customers).toHaveLength(1)
      expect(candidates.customers[0].orders.map((order: { ddt: string | null }) => order.ddt?.slice(0, 10))).toEqual(expect.arrayContaining(['DDT n. 1/2', 'DDT n. 2/2']))

      const { data: invoice } = await api.post('/admin/documenti/fatture', { order_ids: [first.orderId, second.orderId], customer, paymentTerms: 'Bonifico a 30 giorni' }, owner)
      expect(invoice.document.number).toBe(1)

      const { data: list } = await api.get('/admin/documenti', owner)
      const fattura = list.documents.find((document: { kind: string }) => document.kind === 'fattura')
      expect(fattura).toMatchObject({ customer: 'Bottega Rossi srl', total: 48, orderIds: expect.arrayContaining([first.orderId, second.orderId]) })
      expect(list.next).toEqual({ ddt: 3, fattura: 2 })

      const pdf = await api.get(`/admin/documenti/${fattura.id}/pdf`, { ...owner, responseType: 'arraybuffer' })
      expect(pdf.headers['content-type']).toBe('application/pdf')
      expect(Buffer.from(pdf.data).subarray(0, 5).toString()).toBe('%PDF-')

      const csv = await api.get(`/admin/documenti/riepilogo?year=${fattura.year}`, owner)
      expect(csv.data).toContain('Bottega Rossi srl')
      expect(csv.data).toContain('DDT n. 1/')

      const twice = await api.post('/admin/documenti/fatture', { order_ids: [first.orderId], customer }, owner).catch(fail)
      expect(twice.data.message).toMatch(/già in una fattura/)

      // Annullata la fattura, il numero resta e gli ordini si fatturano di nuovo con il successivo.
      await api.post(`/admin/documenti/${fattura.id}/annulla`, {}, owner)
      const { data: redo } = await api.post('/admin/documenti/fatture', { order_ids: [first.orderId], customer }, owner)
      expect(redo.document.number).toBe(2)
      const low = await api.post('/admin/documenti/fatture', { order_ids: [second.orderId], customer, number: 1 }, owner).catch(fail)
      expect(low.data.message).toMatch(/non è libero: il prossimo è 3/)
    })

    it('la fattura chiede i dati fiscali completi', async () => {
      const { orderId } = await placeBooking(getContainer(), input, actor)
      const response = await api.post('/admin/documenti/fatture', { order_ids: [orderId], customer: { ...customer, vat: '', postalCode: '' } }, owner).catch(fail)
      expect(response.status).toBe(400)
      expect(response.data.message).toBe('Per la fattura mancano: partita IVA (11 cifre), CAP.')
    })

    it('l’agente fa il DDT dei suoi ordini, non le fatture né i DDT degli altri', async () => {
      const container = getContainer()
      const agent = await adminWithRoles(container, 'bruno@test.local', [AGENT_ROLE_ID])
      const mine = await placeBooking(container, input, actor)
      const other = await placeBooking(container, { ...input, agent_id: null }, actor)

      const { data: draft } = await api.get(`/admin/sell/bookings/${mine.orderId}/ddt`, agent)
      const { data: ddt } = await api.post(`/admin/sell/bookings/${mine.orderId}/ddt`, { recipient: draft.draft.recipient }, agent)
      expect(ddt.document.number).toBe(1)
      const pdf = await api.get(`/admin/sell/bookings/${mine.orderId}/ddt/pdf`, { ...agent, responseType: 'arraybuffer' })
      expect(pdf.headers['content-type']).toBe('application/pdf')

      const { data: bookings } = await api.get('/admin/sell/bookings', agent)
      expect(bookings.bookings[0].documents.ddt).toMatchObject({ number: 1 })

      expect((await api.post(`/admin/sell/bookings/${other.orderId}/ddt`, { recipient: draft.draft.recipient }, agent).catch(fail)).status).toBeGreaterThanOrEqual(400)
      expect((await api.get('/admin/documenti', agent).catch(fail)).status).toBe(403)
      expect((await api.post('/admin/documenti/fatture', { order_ids: [mine.orderId], customer }, agent).catch(fail)).status).toBe(403)
    })
  },
})
