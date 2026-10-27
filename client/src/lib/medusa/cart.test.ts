import { describe, expect, it } from 'vitest'
import { toCart, toOrderSummary, toPaymentMethod, toShippingChoice } from './cart'

describe('toCart', () => {
  it('somma le quantità e legge opzione di consegna e pagamento', () => {
    const cart = toCart({
      id: 'cart_1',
      email: 'anna@example.com',
      completed_at: null,
      items: [
        {
          id: 'li_1',
          variant_id: 'v1',
          variant_sku: 'OLIO-750ML',
          product_handle: 'olio-extravergine',
          quantity: 2,
          unit_price: 15,
          total: 30,
        },
        {
          id: 'li_2',
          variant_id: 'v2',
          variant_sku: 'MIELE-250G',
          product_handle: 'miele',
          quantity: 1,
          unit_price: 5,
        },
      ],
      item_total: 35,
      shipping_total: 0,
      tax_total: 1.6,
      total: 35,
      shipping_methods: [{ shipping_option_id: 'so_1' }],
      payment_collection: { id: 'pay_col_1' },
    })
    expect(cart.itemCount).toBe(3)
    expect(cart.lines[1].total).toBe(5)
    expect(cart.shippingOptionId).toBe('so_1')
    expect(cart.paymentCollectionId).toBe('pay_col_1')
    expect(cart.completed).toBe(false)
  })

  it('riconosce un carrello già diventato ordine', () => {
    expect(toCart({ id: 'cart_2', completed_at: '2026-10-14T10:00:00Z' }).completed).toBe(true)
  })
})

describe('toShippingChoice', () => {
  it('distingue il ritiro dal codice del tipo e legge il comune della sede', () => {
    const choice = toShippingChoice({
      id: 'so_1',
      name: 'Ritiro a Cerchio',
      amount: 0,
      type: { code: 'ritiro-1' },
      service_zone: {
        fulfillment_set: { location: { address: { city: 'Cerchio' } } },
      },
    })
    expect(choice).toEqual({
      id: 'so_1',
      kind: 'pickup',
      name: 'Ritiro a Cerchio',
      city: 'Cerchio',
      amount: 0,
    })
  })

  it('tratta come spedizione ogni altro codice', () => {
    expect(
      toShippingChoice({
        id: 'so_2',
        name: 'Spedizione',
        amount: 9,
        type: { code: 'spedizione' },
      }).kind,
    ).toBe('delivery')
  })
})

describe('toPaymentMethod', () => {
  it('mappa i fornitori di Medusa sui metodi della vetrina', () => {
    expect(toPaymentMethod('pp_bonifico_lequote')).toBe('bonifico')
    expect(toPaymentMethod('pp_ritiro_lequote')).toBe('ritiro')
    expect(toPaymentMethod('pp_stripe_stripe')).toBeNull()
    expect(toPaymentMethod(undefined)).toBeNull()
  })
})

describe('toOrderSummary', () => {
  it('legge numero, consegna e metodo di pagamento', () => {
    const order = toOrderSummary({
      id: 'order_1',
      display_id: 7,
      created_at: '2026-12-31T23:30:00Z',
      email: 'anna@example.com',
      items: [{ id: 'oli_1', quantity: 1, unit_price: 15 }],
      item_total: 15,
      shipping_total: 0,
      tax_total: 0.58,
      total: 15,
      shipping_methods: [{ name: 'Ritiro a Cerchio' }],
      payment_collections: [{ payments: [{ provider_id: 'pp_bonifico_lequote' }] }],
    })
    expect(order.code).toBe('V7WHE27')
    expect(order.shippingName).toBe('Ritiro a Cerchio')
    expect(order.paymentMethod).toBe('bonifico')
    expect(order.lines).toHaveLength(1)
  })
})
