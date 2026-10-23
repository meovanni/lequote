import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { AGENT_ROLE_ID, ensureRoles } from '../../src/lib/roles'
import { VENDITE_MODULE } from '../../src/modules/vendite'
import type VenditeModuleService from '../../src/modules/vendite/service'
import { adminWithRoles } from '../helpers/admin'
import { seedShop } from '../helpers/shop'

jest.setTimeout(300 * 1000)

// Ordini importati da Excel: una riga, un ordine; importo del file come prezzo forzato (IVA
// inclusa), altrimenti listino; le righe che non vanno non fermano le altre.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }
    let admin: { headers: Record<string, string> }

    beforeEach(async () => {
      const container = getContainer()
      await seedShop(container)
      await ensureRoles(container)
      admin = await adminWithRoles(container, 'titolare@test.local')
    })

    it('crea un ordine per riga, con l’importo del file o il listino, e riporta le righe che non vanno', async () => {
      const { data: catalog } = await api.get('/admin/backoffice/catalog', admin)
      const tank = catalog.variants.find((variant: { sku: string }) => variant.sku === 'OLIO-5L')
      const giulia = (await getContainer().resolve<VenditeModuleService>(VENDITE_MODULE).createSalesAgents([{ name: 'Giulia' }]))[0]

      const { data } = await api.post(
        '/admin/backoffice/order-imports',
        {
          variant_id: tank.variantId,
          agent_id: giulia.id,
          file_name: 'prenotazioni.xlsx',
          rows: [
            { line: 2, name: 'Anna Di Marco', tanks: 2 },
            { line: 3, name: 'Ferri', tanks: 3, amount: 210 },
            { line: 4, name: 'Troppi', tanks: 5000 },
          ],
        },
        admin,
      )
      expect(data.results.map((result: { line: number; ok: boolean }) => [result.line, result.ok])).toEqual([
        [2, true],
        [3, true],
        [4, false],
      ])
      expect(data.results[2].error).toBeTruthy()

      const anna = (await api.get(`/admin/backoffice/orders/${data.results[0].order_id}`, admin)).data
      expect(anna.booking.customer).toBe('Anna Di Marco')
      expect(anna.booking.total).toBe(tank.price * 2)
      expect(anna.booking.lines[0]).toEqual(expect.objectContaining({ quantity: 2, sku: 'OLIO-5L' }))
      expect(anna.booking.delivery).toMatch(/^Ritiro a /)
      expect(anna.booking.notes).toBe('Importato da prenotazioni.xlsx, riga 2')
      expect(anna.agent.name).toBe('Giulia')

      const ferri = (await api.get(`/admin/backoffice/orders/${data.results[1].order_id}`, admin)).data
      expect(ferri.booking.total).toBe(210)
      expect(ferri.booking.lines[0]).toEqual(expect.objectContaining({ quantity: 3, unitPrice: 70 }))
      expect(ferri.payments.due).toBe(210)
    })

    it('controlla i dati e resta riservato a chi gestisce gli ordini', async () => {
      const { data: catalog } = await api.get('/admin/backoffice/catalog', admin)
      const tank = catalog.variants.find((variant: { sku: string }) => variant.sku === 'OLIO-5L')
      const body = { variant_id: tank.variantId, rows: [{ line: 2, name: 'Anna', tanks: 1 }] }

      expect((await api.post('/admin/backoffice/order-imports', { ...body, rows: [] }, admin).catch(fail)).status).toBe(400)
      expect((await api.post('/admin/backoffice/order-imports', { ...body, rows: [{ line: 2, name: '', tanks: 1 }] }, admin).catch(fail)).status).toBe(400)
      expect((await api.post('/admin/backoffice/order-imports', { ...body, rows: [{ line: 2, name: 'Anna', tanks: 0 }] }, admin).catch(fail)).status).toBe(400)

      const agent = await adminWithRoles(getContainer(), 'bruno@test.local', [AGENT_ROLE_ID])
      expect((await api.post('/admin/backoffice/order-imports', body, agent).catch(fail)).status).toBe(403)
    })
  },
})
