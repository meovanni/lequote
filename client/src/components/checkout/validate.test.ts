import { describe, expect, it } from 'vitest'
import type { ShippingChoice } from '@/lib/medusa/cart'
import { EMPTY_CHECKOUT, validateCheckout, type CheckoutValues } from './validate'

const pickup: ShippingChoice = {
  id: 'so_pickup',
  kind: 'pickup',
  name: 'Ritiro a Cerchio',
  city: 'Cerchio',
  amount: 0,
}
const delivery: ShippingChoice = {
  id: 'so_ship',
  kind: 'delivery',
  name: 'Spedizione',
  city: '',
  amount: 9,
}

const valid: CheckoutValues = {
  ...EMPTY_CHECKOUT,
  firstName: 'Anna',
  lastName: 'Di Marco',
  email: 'anna@example.com',
  phone: '333 000 0000',
  deliveryId: pickup.id,
  payment: 'ritiro',
  terms: true,
}

describe('validateCheckout', () => {
  it('accetta un ritiro senza indirizzo', () => {
    expect(validateCheckout(valid, pickup)).toEqual({})
  })

  it('segnala tutti i campi obbligatori di un modulo vuoto', () => {
    expect(validateCheckout(EMPTY_CHECKOUT, undefined)).toEqual({
      firstName: 'required',
      lastName: 'required',
      email: 'required',
      phone: 'required',
      deliveryId: 'delivery',
      payment: 'payment',
      terms: 'terms',
    })
  })

  it('rifiuta un indirizzo email senza dominio', () => {
    expect(validateCheckout({ ...valid, email: 'anna@example' }, pickup).email).toBe('email')
  })

  it('chiede indirizzo, CAP e provincia solo per la spedizione', () => {
    const values = {
      ...valid,
      deliveryId: delivery.id,
      payment: 'bonifico' as const,
      postalCode: '6402',
      province: 'Ter',
    }
    expect(validateCheckout(values, delivery)).toEqual({
      address: 'required',
      city: 'required',
      postalCode: 'postalCode',
      province: 'province',
    })
    const complete = {
      ...values,
      address: 'Via Nazionale 1',
      city: 'Roseto degli Abruzzi',
      postalCode: '64026',
      province: 'te',
    }
    expect(validateCheckout(complete, delivery)).toEqual({})
  })

  it('non accetta il pagamento al ritiro con la spedizione', () => {
    const values = {
      ...valid,
      deliveryId: delivery.id,
      address: 'Via Nazionale 1',
      city: 'Roseto degli Abruzzi',
      postalCode: '64026',
      province: 'TE',
    }
    expect(validateCheckout(values, delivery)).toEqual({ payment: 'payment' })
  })
})
