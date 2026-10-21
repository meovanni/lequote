import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { Modules } from '@medusajs/framework/utils'
import { AGENT_ROLE_ID, ensureRoles } from '../../src/lib/roles'
import { VENDITE_MODULE } from '../../src/modules/vendite'
import type VenditeModuleService from '../../src/modules/vendite/service'
import { adminWithRoles } from '../helpers/admin'
import { seedShop } from '../helpers/shop'

jest.setTimeout(300 * 1000)

// Area vendita degli agenti (/admin/sell) e gestione dal back office (/admin/backoffice,
// /admin/agents), con i ruoli veri.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }
    let admin: { headers: Record<string, string> }
    let bruno: { headers: Record<string, string> }
    let giulia: { headers: Record<string, string> }

    beforeEach(async () => {
      const container = getContainer()
      await seedShop(container)
      await ensureRoles(container)
      const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
      await vendite.createSalesAgents([
        { name: 'Bruno', email: 'bruno@test.local' },
        { name: 'Giulia', email: 'giulia@test.local' },
        { name: 'Luciana', email: null },
      ])
      admin = await adminWithRoles(container, 'titolare@test.local')
      bruno = await adminWithRoles(container, 'bruno@test.local', [AGENT_ROLE_ID])
      giulia = await adminWithRoles(container, 'giulia@test.local', [AGENT_ROLE_ID])
    })

    async function newBooking(headers: { headers: Record<string, string> }, path = '/admin/sell/bookings', extra: object = {}) {
      const { data: catalog } = await api.get(path === '/admin/sell/bookings' ? '/admin/sell/catalog' : '/admin/backoffice/catalog', headers)
      const olio = catalog.variants.find((variant: { sku: string }) => variant.sku === 'OLIO-750ML')
      const pickup = catalog.delivery_options.find((option: { pickup: boolean }) => option.pickup)
      return api.post(
        path,
        {
          customer: { kind: 'privato', first_name: 'Anna', last_name: 'Di Marco', phone: '3330000000' },
          items: [{ variant_id: olio.id ?? olio.variantId, quantity: 2 }],
          shipping_option_id: pickup.id,
          ...extra,
        },
        headers,
      )
    }

    it('l’agente vede catalogo con prezzi e disponibilità e le sole consegne attive', async () => {
      const { data } = await api.get('/admin/sell/catalog', bruno)
      const olio = data.variants.find((variant: { sku: string }) => variant.sku === 'OLIO-750ML')
      expect(olio.price).toBeGreaterThan(0)
      // 50 pezzi di prova in ciascuna delle due sedi del canale.
      expect(olio.stock).toBe(100)
      const names = (options: { name: string }[]) => options.map((option) => option.name)
      expect(names(data.delivery_options)).toEqual(expect.arrayContaining(['Ritiro a Roseto degli Abruzzi', 'Ritiro a Cerchio', 'Spedizione in Italia']))

      // Spenta la spedizione (come nel seed, in attesa della tariffa), l'agente non può sceglierla.
      const fulfillment = getContainer().resolve(Modules.FULFILLMENT)
      const [shipping] = await fulfillment.listShippingOptions({ name: 'Spedizione in Italia' }, { relations: ['rules'] })
      await fulfillment.updateShippingOptions(shipping.id, {
        rules: shipping.rules.map((rule) => (rule.attribute === 'enabled_in_store' ? { id: rule.id, value: 'false' } : { id: rule.id })),
      })
      const { data: after } = await api.get('/admin/sell/catalog', bruno)
      expect(names(after.delivery_options)).not.toContain('Spedizione in Italia')
    })

    it('l’agente inserisce, modifica e incassa le sue prenotazioni, e non vede quelle degli altri', async () => {
      const created = await newBooking(bruno)
      expect(created.status).toBe(201)
      const booking = created.data.booking
      expect(booking.insertedBy).toEqual({ type: 'agente', name: 'Bruno' })

      const edited = await api.post(`/admin/sell/bookings/${booking.id}`, { items: [{ variant_id: booking.lines[0].variantId, quantity: 1 }], notes: 'Passo martedì' }, bruno)
      expect(edited.data.booking.lines[0].quantity).toBe(1)

      const paid = await api.post(`/admin/sell/bookings/${booking.id}/payments`, { amount: 5, method: 'contanti' }, bruno)
      expect(paid.data.payments.paid).toBe(5)

      const { data: history } = await api.get('/admin/sell/bookings', bruno)
      expect(history.bookings.map((row: { id: string }) => row.id)).toEqual([booking.id])
      expect((await api.get(`/admin/sell/bookings/${booking.id}`, giulia).catch(fail)).status).toBe(404)
      expect((await api.post(`/admin/sell/bookings/${booking.id}/payments`, { amount: 1, method: 'contanti' }, giulia).catch(fail)).status).toBe(404)
      expect((await api.get('/admin/sell/bookings', giulia)).data.bookings).toEqual([])
    })

    it('la classifica mostra a ogni agente posizione e totali, senza clienti degli altri', async () => {
      await newBooking(bruno)
      const { data } = await api.get('/admin/sell/me', giulia)
      expect(data.agent.name).toBe('Giulia')
      expect(data.ranking[0]).toEqual(expect.objectContaining({ position: 1, name: 'Bruno', quantity: 2, me: false }))
      expect(JSON.stringify(data.ranking)).not.toMatch(/Anna/)
    })

    it('l’agente non entra nelle rotte del back office e un account senza agente non entra nell’area vendita', async () => {
      expect((await newBooking(bruno, '/admin/backoffice/orders').catch(fail)).status).toBe(403)
      expect((await api.get('/admin/agents', bruno).catch(fail)).status).toBe(403)
      expect((await api.get('/admin/sell/me', admin).catch(fail)).status).toBe(400)
    })

    it('dal back office: nuovo ordine attribuito a un agente, incasso, riepiloghi e invito', async () => {
      const { data: catalog } = await api.get('/admin/backoffice/catalog', admin)
      const giuliaId = catalog.agents.find((agent: { name: string }) => agent.name === 'Giulia').id
      const olio = catalog.variants.find((variant: { sku: string }) => variant.sku === 'OLIO-750ML')
      const pickup = catalog.delivery_options.find((option: { pickup: boolean }) => option.pickup)
      const created = await api.post(
        '/admin/backoffice/orders',
        {
          customer: { kind: 'azienda', first_name: 'Mario', last_name: 'Rossi', company: 'Bottega Rossi srl', vat_number: '01234567890', phone: '3331112222' },
          items: [{ variant_id: olio.variantId, quantity: 3 }],
          shipping_option_id: pickup.id,
          agent_id: giuliaId,
        },
        admin,
      )
      const orderId = created.data.order_id

      const { data: detail } = await api.get(`/admin/backoffice/orders/${orderId}`, admin)
      expect(detail.booking.insertedBy).toEqual({ type: 'admin', name: 'titolare@test.local' })
      expect(detail.agent.name).toBe('Giulia')
      await api.post(`/admin/backoffice/orders/${orderId}/payments`, { amount: detail.payments.due, method: 'bonifico' }, admin)

      const { data: summary } = await api.get('/admin/agents/summary', admin)
      const giuliaRow = summary.agents.find((row: { agent: { name: string } }) => row.agent.name === 'Giulia')
      expect(giuliaRow.summary.byCustomer[0]).toEqual(expect.objectContaining({ customer: 'Bottega Rossi srl', quantity: 3 }))
      expect(giuliaRow.summary.outstanding).toBe(0)

      const luciana = (await api.get('/admin/agents', admin)).data.agents.find((agent: { name: string }) => agent.name === 'Luciana')
      const invite = await api.post(`/admin/agents/${luciana.id}/invite`, { email: 'Luciana@Test.local' }, admin)
      expect(invite.data.agent.email).toBe('luciana@test.local')
      expect(invite.data.invite_url).toMatch(/\/invite\?token=/)
    })

    it('rifiuta un’azienda senza partita IVA', async () => {
      const response = await newBooking(bruno, '/admin/sell/bookings', {
        customer: { kind: 'azienda', first_name: 'Mario', last_name: 'Rossi', company: 'Bottega Rossi srl', phone: '3331112222' },
      }).catch(fail)
      expect(response.status).toBe(400)
    })
  },
})
