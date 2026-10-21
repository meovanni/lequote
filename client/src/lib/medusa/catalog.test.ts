import { describe, expect, it } from 'vitest'
import { toCatalogProduct, toCatalogVariant } from './catalog'

const base = { id: 'v1', sku: 'OLIO-750ML', title: 'Bottiglia 750 ml' }

describe('varianti dal catalogo Medusa', () => {
  it('prende il prezzo IVA inclusa e la giacenza', () => {
    const variant = toCatalogVariant({
      ...base,
      manage_inventory: true,
      inventory_quantity: 4,
      calculated_price: { calculated_amount: 15 },
    })
    expect(variant).toEqual({
      ...base,
      price: 15,
      stock: 4,
      purchasable: true,
    })
  })

  it('non è ordinabile senza giacenza, salvo vendita allo scoperto', () => {
    const raw = {
      ...base,
      manage_inventory: true,
      inventory_quantity: 0,
      calculated_price: { calculated_amount: 15 },
    }
    expect(toCatalogVariant(raw).purchasable).toBe(false)
    expect(toCatalogVariant({ ...raw, allow_backorder: true }).purchasable).toBe(true)
  })

  it('senza giacenza gestita è sempre ordinabile, senza prezzo mai', () => {
    expect(
      toCatalogVariant({
        ...base,
        manage_inventory: false,
        calculated_price: { calculated_amount: 8 },
      }),
    ).toMatchObject({
      stock: null,
      purchasable: true,
    })
    expect(
      toCatalogVariant({
        ...base,
        manage_inventory: false,
        calculated_price: null,
      }),
    ).toMatchObject({
      price: null,
      purchasable: false,
    })
  })

  it('una giacenza negativa conta come zero', () => {
    expect(
      toCatalogVariant({
        ...base,
        manage_inventory: true,
        inventory_quantity: -2,
      }).stock,
    ).toBe(0)
  })

  it('un prodotto senza varianti resta valido', () => {
    expect(toCatalogProduct({ id: 'p1', handle: 'miele', variants: null })).toEqual({
      id: 'p1',
      handle: 'miele',
      variants: [],
    })
  })
})
