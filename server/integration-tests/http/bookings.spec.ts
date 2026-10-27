import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { placeBooking } from '../../src/lib/bookings/create'
import { editBooking } from '../../src/lib/bookings/edit'
import { deliverOrder } from '../../src/lib/magazzino'
import { addPayment, deletePayment, paymentState, updatePayment } from '../../src/lib/bookings/payments'
import { agentOrderIds, loadBookings, salesByAgent } from '../../src/lib/bookings/read'
import type { Actor, BookingInput } from '../../src/lib/bookings/types'
import { VENDITE_MODULE } from '../../src/modules/vendite'
import type VenditeModuleService from '../../src/modules/vendite/service'
import { isPickup, readyCart, seedShop } from '../helpers/shop'

jest.setTimeout(240 * 1000)

// Prenotazioni del gestionale su dati veri: ordine creato con il flusso del sito, incassi ad
// acconti, modifica delle righe, riepiloghi per agente.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let store: { headers: Record<string, string> }
    let bruno: { id: string; name: string }
    let input: BookingInput
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }

    beforeEach(async () => {
      const container = getContainer()
      store = await seedShop(container)
      const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
      bruno = await vendite.createSalesAgents({ name: 'Bruno', email: 'bruno@test.local' })
      await vendite.createSalesAgents({ name: 'Giulia', email: 'giulia@test.local' })

      const { data: products } = await api.get('/store/products?fields=handle,variants.id,variants.sku', store)
      const variants = products.products.flatMap((product: { variants: { id: string; sku: string }[] }) => product.variants)
      const olio = variants.find((variant: { sku: string }) => variant.sku === 'OLIO-750ML')
      const { data: regions } = await api.get('/store/regions', store)
      const { data: cart } = await api.post('/store/carts', { region_id: regions.regions[0].id }, store)
      const { data: options } = await api.get(`/store/shipping-options?cart_id=${cart.cart.id}`, store)
      const pickup = options.shipping_options.find((option: { name: string }) => isPickup(option.name))

      input = {
        customer: { kind: 'azienda', first_name: 'Mario', last_name: 'Rossi', company: 'Bottega Rossi srl', vat_number: '01234567890', phone: '3331112222', email: 'mario@bottega.example' },
        items: [{ variant_id: olio.id, quantity: 2 }],
        shipping_option_id: pickup.id,
        notes: 'Consegna il venerdì',
        agent_id: bruno.id,
      }
    })

    const agentActor = (): Actor => ({ type: 'agente', id: bruno.id, name: 'Bruno' })

    it('crea la prenotazione come ordine vero, attribuito all’agente e con chi l’ha inserita', async () => {
      const { orderId } = await placeBooking(getContainer(), input, agentActor())

      const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({ entity: 'order', fields: ['metadata', 'total', 'shipping_address.company', 'items.quantity'], filters: { id: orderId } })
      const order = data[0] as unknown as { metadata: Record<string, unknown>; total: number; shipping_address: { company: string } }
      expect(order.metadata.inserted_by).toEqual({ type: 'agente', id: bruno.id, name: 'Bruno' })
      expect(order.metadata.backoffice_signature ?? null).toBeNull()
      expect(order.shipping_address.company).toBe('Bottega Rossi srl')
      expect(Number(order.total)).toBeGreaterThan(0)
      expect(await agentOrderIds(getContainer(), bruno.id)).toEqual([orderId])
    })

    it('registra acconto e saldo, rifiuta l’eccedenza e al saldo incassa il pagamento', async () => {
      const { orderId } = await placeBooking(getContainer(), input, agentActor())
      const { total } = await paymentState(getContainer(), orderId)

      const afterDeposit = await addPayment(getContainer(), orderId, { amount: 10, method: 'contanti' }, agentActor())
      expect(afterDeposit.due).toBeCloseTo(total - 10, 2)
      await expect(addPayment(getContainer(), orderId, { amount: total, method: 'assegno' }, agentActor())).rejects.toThrow(/residuo/)

      const settled = await addPayment(getContainer(), orderId, { amount: afterDeposit.due, method: 'bonifico' }, agentActor())
      expect(settled.due).toBe(0)
      expect(settled.payments.map((payment) => payment.method).sort()).toEqual(['bonifico', 'contanti'])

      const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({ entity: 'order', fields: ['payment_collections.payments.captured_at'], filters: { id: orderId } })
      const captured = (data[0] as unknown as { payment_collections: { payments: { captured_at: string | null }[] }[] }).payment_collections[0].payments[0]
      expect(captured.captured_at).not.toBeNull()
    })

    it('modifica righe e note della prenotazione, con il totale ricalcolato', async () => {
      const { orderId } = await placeBooking(getContainer(), input, agentActor())
      const before = (await loadBookings(getContainer(), [orderId]))[0]

      await editBooking(getContainer(), orderId, { items: [{ variant_id: input.items[0].variant_id, quantity: 3 }], notes: 'Consegna il sabato' }, agentActor())

      const after = (await loadBookings(getContainer(), [orderId]))[0]
      expect(after.lines.map((line) => line.quantity)).toEqual([3])
      expect(after.total).toBeCloseTo((before.total / 2) * 3, 2)
      expect(after.notes).toBe('Consegna il sabato')
    })

    it('corregge ed elimina un incasso, senza superare il totale', async () => {
      const { orderId } = await placeBooking(getContainer(), input, agentActor())
      const { total } = await paymentState(getContainer(), orderId)
      const paid = await addPayment(getContainer(), orderId, { amount: total, method: 'contanti' }, agentActor())
      const [payment] = paid.payments

      const changed = await updatePayment(getContainer(), orderId, payment.id, { method: 'bonifico' })
      expect(changed.payments[0].method).toBe('bonifico')
      expect(changed.due).toBe(0)
      await expect(updatePayment(getContainer(), orderId, payment.id, { amount: total + 1 })).rejects.toThrow(/resta da incassare/)

      const reopened = await deletePayment(getContainer(), orderId, payment.id)
      expect(reopened.payments).toEqual([])
      expect(reopened.due).toBeCloseTo(total, 2)
    })

    it('corregge i dati del cliente anche dopo la consegna, ma non i prodotti', async () => {
      const { orderId } = await placeBooking(getContainer(), input, agentActor())
      await deliverOrder(getContainer(), orderId, 'Titolare')
      await editBooking(getContainer(), orderId, { customer: { first_name: 'Marta', last_name: 'Ferri', company: null, phone: '3331112222' } }, agentActor())
      const booking = (await loadBookings(getContainer(), [orderId]))[0]
      expect(booking.customer).toBe('Marta Ferri')
      expect(booking.phone).toBe('3331112222')
      expect(booking.customerFields).toEqual({ first_name: 'Marta', last_name: 'Ferri', company: '' })
      await expect(editBooking(getContainer(), orderId, { items: [{ variant_id: input.items[0].variant_id, quantity: 5 }] }, agentActor())).rejects.toThrow(/consegnato/)
    })

    it('riassume le vendite per agente e prepara la classifica', async () => {
      const { orderId } = await placeBooking(getContainer(), input, agentActor())
      await addPayment(getContainer(), orderId, { amount: 5, method: 'contanti' }, agentActor())

      const { rows, ranking } = await salesByAgent(getContainer())
      const brunoRow = rows.find((row) => row.agent.name === 'Bruno')!
      expect(brunoRow.summary.quantity).toBe(2)
      expect(brunoRow.summary.paid).toBe(5)
      expect(brunoRow.summary.byCustomer[0].customer).toBe('Bottega Rossi srl')
      expect(ranking.map((row) => row.name)).toEqual(['Bruno', 'Giulia'])
    })

    it('dal sito il pagamento del gestionale è rifiutato, anche con metadati inventati', async () => {
      const cartId = await readyCart(api, store, isPickup, 'pp_bonifico_lequote')
      await api.post(`/store/carts/${cartId}`, { metadata: { inserted_by: { type: 'admin' }, backoffice_signature: 'a'.repeat(64) } }, store)
      const { data: cart } = await api.get(`/store/carts/${cartId}?fields=payment_collection.id`, store)
      await api.post(`/store/payment-collections/${cart.cart.payment_collection.id}/payment-sessions`, { provider_id: 'pp_gestionale_lequote' }, store)

      const response = await api.post(`/store/carts/${cartId}/complete`, {}, store).catch(fail)
      expect(response.status).toBe(400)
      expect(response.data.message).toMatch(/gestionale/)
      expect(await getContainer().resolve(Modules.ORDER).listOrders({})).toHaveLength(0)
    })
  },
})
