import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { ensureRoles } from '../../src/lib/roles'
import { adminWithRoles } from '../helpers/admin'
import { seedShop } from '../helpers/shop'

jest.setTimeout(300 * 1000)

// Giacenze e ordini del gestionale: Medusa riserva ogni prodotto di un ordine in una sola sede, quindi
// si ordina al massimo quanto c'è nella sede più fornita, e la disponibilità segue ordini, modifiche e
// annullamenti. Giacenze di prova: 50 pezzi per formato in ciascuna delle due sedi.
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

    const variantOf = async (sku: string) =>
      (await api.get('/admin/backoffice/catalog', admin)).data.variants.find((variant: { sku: string }) => variant.sku === sku)
    const perSite = async (sku: string) => Object.values((await variantOf(sku)).stockByLocation as Record<string, number>).sort((a, b) => a - b)
    const order = (variantId: string, quantity: number) =>
      api.post('/admin/backoffice/orders', { customer: { first_name: 'Anna' }, items: [{ variant_id: variantId, quantity }] }, admin)

    it('il catalogo dà il massimo per ordine e la disponibilità per sede', async () => {
      const tank = await variantOf('OLIO-5L')
      expect(tank.available).toBe(50)
      expect(tank.stock).toBe(100)
      expect(await perSite('OLIO-5L')).toEqual([50, 50])
    })

    it('si ordina al massimo quanto c’è nella sede più fornita, con un messaggio chiaro', async () => {
      const tank = await variantOf('OLIO-5L')
      const split = await order(tank.variantId, 60).catch(fail)
      expect(split.status).toBe(400)
      expect(split.data.message).toBe(
        'Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 60, disponibili 50). Ogni prodotto di un ordine parte da una sola sede: per ordinarne di più, spostate la merce tra le sedi in Inventario.',
      )

      expect((await order(tank.variantId, 50)).status).toBe(201)
      expect((await variantOf('OLIO-5L')).available).toBe(50)
      expect((await order(tank.variantId, 50)).status).toBe(201)
      expect((await variantOf('OLIO-5L')).available).toBe(0)

      const soldOut = await order(tank.variantId, 1).catch(fail)
      expect(soldOut.data.message).toBe('Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 1, esaurito).')
    })

    it('modifiche e annullamento tengono allineata la disponibilità', async () => {
      const tank = await variantOf('OLIO-5L')
      const honey = await variantOf('MIELE-500G')

      const id = (await order(tank.variantId, 10)).data.order_id
      expect(await perSite('OLIO-5L')).toEqual([40, 50])

      // L'ordine tiene già 10 pezzi: può salire fino a 10 + 50.
      const raise = await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 61 }] }, admin).catch(fail)
      expect(raise.status).toBe(400)
      expect(raise.data.message).toMatch(/^Disponibilità insufficiente: Olio Extravergine, Latta 5 l \(richiesti 61, disponibili 60\)/)
      expect(await perSite('OLIO-5L')).toEqual([40, 50])

      await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 30 }] }, admin)
      expect(await perSite('OLIO-5L')).toEqual([20, 50])

      const added = await api
        .post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 30 }, { variant_id: honey.variantId, quantity: 51 }] }, admin)
        .catch(fail)
      expect(added.status).toBe(400)
      expect(added.data.message).toMatch(/^Disponibilità insufficiente: Miele, Vasetto 500 g \(richiesti 51, disponibili 50\)/)

      await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 4 }] }, admin)
      expect(await perSite('OLIO-5L')).toEqual([46, 50])

      await api.post(`/admin/orders/${id}/cancel`, {}, admin)
      expect(await perSite('OLIO-5L')).toEqual([50, 50])
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
        expect.objectContaining({ line: 4, ok: false, error: 'Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 40, disponibili 10).' }),
      ])
    })
  },
})
