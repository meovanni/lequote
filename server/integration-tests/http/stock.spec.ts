import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { BANK_TRANSFER_PROVIDER_ID } from '../../src/lib/checkout-rules'
import { ensureRoles } from '../../src/lib/roles'
import { adminWithRoles } from '../helpers/admin'
import { seedShop } from '../helpers/shop'

jest.setTimeout(300 * 1000)

// Magazzino in litri e chili (modules/magazzino): sfuso più pezzi pronti. Gli ordini prendono prima
// i pezzi pronti, il resto si confeziona dallo sfuso; l'impegnato si ricalcola dagli ordini aperti.
// Magazzino di prova (scripts/dev-stock.ts): olio 300 L sfusi, 50 bottiglie e 20 latte pronte.
// Latte ordinabili: 20 pronte + 300 L / 5 L = 80.
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
    const available = async (sku = 'OLIO-5L') => (await variantOf(sku)).available
    const order = (variantId: string, quantity: number) =>
      api.post('/admin/backoffice/orders', { customer: { first_name: 'Anna' }, items: [{ variant_id: variantId, quantity }] }, admin)
    const oil = async () => (await api.get('/admin/gestione', admin)).data.lines.find((line: { line: string }) => line.line === 'olio')

    it('conta pezzi pronti e sfuso, e offre lo sfuso in litri', async () => {
      expect(await available()).toBe(80)
      const bulk = await variantOf('OLIO-SFUSO')
      expect(bulk).toMatchObject({ available: 300, unit: 'L', bulk: true })
      expect(await oil()).toMatchObject({ bulk: 300_000, total: 300_000 + 50 * 750 + 20 * 5000, freeBulk: 300_000 })
    })

    it('le righe prendono i pezzi pronti e poi lo sfuso, con un messaggio chiaro oltre', async () => {
      const tank = await variantOf('OLIO-5L')
      expect((await order(tank.variantId, 60)).status).toBe(201)
      // 20 latte pronte e 40 da confezionare (200 L): restano 100 L di sfuso.
      expect(await oil()).toMatchObject({ freeBulk: 100_000 })
      expect((await oil()).formats.find((row: { sku: string }) => row.sku === 'OLIO-5L')).toMatchObject({ ready: 20, ordered: 60, toPack: 40 })
      expect(await available()).toBe(20)
      expect(await available('OLIO-SFUSO')).toBe(100)

      const tooMany = await order(tank.variantId, 21).catch(fail)
      expect(tooMany.status).toBe(400)
      expect(tooMany.data.message).toBe('Disponibilità insufficiente: Latta 5 L (richiesti 21, disponibili 20).')

      const bulk = await variantOf('OLIO-SFUSO')
      const tooMuchBulk = await order(bulk.variantId, 101).catch(fail)
      expect(tooMuchBulk.data.message).toBe('Disponibilità insufficiente: Olio da imbottigliare (richiesti 101 L, disponibili 100 L).')
      expect((await order(bulk.variantId, 100)).status).toBe(201)
      expect(await available()).toBe(0)
    })

    it('modifiche e annullamento tengono allineata la disponibilità', async () => {
      const tank = await variantOf('OLIO-5L')
      const id = (await order(tank.variantId, 10)).data.order_id
      expect(await available()).toBe(70)

      const raise = await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 81 }] }, admin).catch(fail)
      expect(raise.status).toBe(400)
      expect(raise.data.message).toBe('Disponibilità insufficiente: Latta 5 L (richiesti 81, disponibili 80).')

      await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 80 }] }, admin)
      expect(await available()).toBe(0)

      await api.post(`/admin/orders/${id}/cancel`, {}, admin)
      expect(await available()).toBe(80)
    })

    it('la consegna scala la merce e si può annullare', async () => {
      const tank = await variantOf('OLIO-5L')
      const id = (await order(tank.variantId, 30)).data.order_id
      await api.post(`/admin/gestione/orders/${id}/deliver`, {}, admin)

      // 20 latte pronte e 10 confezionate al momento (50 L).
      const after = await oil()
      expect(after.bulk).toBe(250_000)
      expect(after.formats.find((row: { sku: string }) => row.sku === 'OLIO-5L')).toMatchObject({ ready: 0, ordered: 0 })
      expect(await available()).toBe(50)
      const locked = await api.post(`/admin/backoffice/orders/${id}`, { items: [{ variant_id: tank.variantId, quantity: 1 }] }, admin).catch(fail)
      expect(locked.status).toBe(400)
      const again = await api.post(`/admin/gestione/orders/${id}/deliver`, {}, admin).catch(fail)
      expect(again.status).toBe(400)

      await api.delete(`/admin/gestione/orders/${id}/deliver`, admin)
      expect(await oil()).toMatchObject({ bulk: 300_000 })
      expect(await available()).toBe(50)
    })

    it('modifiche in riga: quantità contate, confezionamento e prezzi', async () => {
      await api.post('/admin/gestione/stock', { sku: 'OLIO-SFUSO', quantity: 120.5 }, admin)
      expect(await oil()).toMatchObject({ bulk: 120_500 })

      await api.post('/admin/gestione/pack', { sku: 'OLIO-5L', pieces: 10 }, admin)
      const packed = await oil()
      expect(packed.bulk).toBe(70_500)
      expect(packed.formats.find((row: { sku: string }) => row.sku === 'OLIO-5L').ready).toBe(30)

      const tooMuch = await api.post('/admin/gestione/pack', { sku: 'OLIO-5L', pieces: 15 }, admin).catch(fail)
      expect(tooMuch.status).toBe(400)

      // Il prezzo al litro trascina i formati; il supplemento si somma solo al suo formato.
      await api.post('/admin/gestione/prices', { line: 'olio', unit_price: 12 }, admin)
      expect((await variantOf('OLIO-SFUSO')).price).toBe(12)
      expect((await variantOf('OLIO-5L')).price).toBe(60)
      expect((await variantOf('OLIO-750ML')).price).toBe(9)
      await api.post('/admin/gestione/prices', { line: 'olio', surcharge: { sku: 'OLIO-750ML', amount: 1.5 } }, admin)
      expect((await variantOf('OLIO-750ML')).price).toBe(10.5)
      await api.post('/admin/gestione/prices', { line: 'olio', unit_price: 14 }, admin)
      expect((await variantOf('OLIO-750ML')).price).toBe(12)
      expect((await variantOf('OLIO-5L')).price).toBe(70)
      const { data: shop } = await api.get('/store/products?fields=variants.sku,*variants.calculated_price&region_id=' + (await api.get('/store/regions', store)).data.regions[0].id, store)
      const tin = shop.products.flatMap((product: { variants: { sku: string; calculated_price: { calculated_amount: number } }[] }) => product.variants).find((variant: { sku: string }) => variant.sku === 'OLIO-5L')
      expect(tin.calculated_price.calculated_amount).toBe(70)
    })

    it('dal sito si vendono i formati fino a quanto lo sfuso permette, non lo sfuso', async () => {
      const { data: stock } = await api.get('/store/magazzino', store)
      expect(stock.available).toEqual({ 'OLIO-750ML': 450, 'OLIO-5L': 80, 'MIELE-250G': 290, 'MIELE-500G': 170 })

      const checkout = async (sku: string, quantity: number) => {
        const { data: regions } = await api.get('/store/regions', store)
        const variant = await variantOf(sku)
        const { data: created } = await api.post('/store/carts', { region_id: regions.regions[0].id }, store)
        const cartId = created.cart.id as string
        await api.post(`/store/carts/${cartId}/line-items`, { variant_id: variant.variantId, quantity }, store)
        const address = { first_name: 'Anna', last_name: 'Di Marco', address_1: 'Via Roma 1', city: 'Teramo', postal_code: '64100', country_code: 'it', phone: '3330000000' }
        await api.post(`/store/carts/${cartId}`, { email: 'anna@example.com', shipping_address: address, billing_address: address }, store)
        const { data: options } = await api.get(`/store/shipping-options?cart_id=${cartId}`, store)
        const pickup = options.shipping_options.find((option: { name: string }) => option.name === 'Ritiro a Cerchio')
        await api.post(`/store/carts/${cartId}/shipping-methods`, { option_id: pickup.id }, store)
        const { data: collection } = await api.post('/store/payment-collections', { cart_id: cartId }, store)
        await api.post(`/store/payment-collections/${collection.payment_collection.id}/payment-sessions`, { provider_id: BANK_TRANSFER_PROVIDER_ID }, store)
        return api.post(`/store/carts/${cartId}/complete`, {}, store).catch(fail)
      }

      expect(((await checkout('OLIO-5L', 60)) as { data: { type: string } }).data.type).toBe('order')
      expect(await available()).toBe(20)
      const overLimit = (await checkout('OLIO-5L', 21)) as { status: number; data: { message: string } }
      expect(overLimit.status).toBe(400)
      const bulk = (await checkout('OLIO-SFUSO', 5)) as { status: number; data: { message: string } }
      expect(bulk.status).toBe(400)
      expect(bulk.data.message).toBe('L’olio e il miele sfusi si ordinano solo contattando l’azienda.')
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
        expect.objectContaining({ line: 4, ok: false, error: 'Disponibilità insufficiente: Latta 5 L (richiesti 40, esaurito).' }),
      ])
    })
  },
})
