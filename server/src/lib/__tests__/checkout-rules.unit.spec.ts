import { PAY_AT_PICKUP_PROVIDER_ID, isPickupOptionCode, payAtPickupViolation } from '../checkout-rules'

describe('isPickupOptionCode', () => {
  it('riconosce i codici "ritiro-…" del seed', () => {
    expect(isPickupOptionCode('ritiro-0')).toBe(true)
    expect(isPickupOptionCode('spedizione')).toBe(false)
    expect(isPickupOptionCode(null)).toBe(false)
    expect(isPickupOptionCode(undefined)).toBe(false)
  })
})

describe('payAtPickupViolation', () => {
  it('accetta il bonifico con qualsiasi consegna', () => {
    expect(payAtPickupViolation({ providerIds: ['pp_bonifico_lequote'], optionCodes: ['spedizione'] })).toBeNull()
  })

  it('accetta il pagamento al ritiro con un ritiro', () => {
    expect(payAtPickupViolation({ providerIds: [PAY_AT_PICKUP_PROVIDER_ID], optionCodes: ['ritiro-1'] })).toBeNull()
  })

  it('rifiuta il pagamento al ritiro con una spedizione', () => {
    expect(payAtPickupViolation({ providerIds: [PAY_AT_PICKUP_PROVIDER_ID], optionCodes: ['spedizione'] })).toMatch(/ritiro/)
  })

  it('rifiuta il pagamento al ritiro se una delle consegne non è un ritiro', () => {
    expect(
      payAtPickupViolation({ providerIds: [PAY_AT_PICKUP_PROVIDER_ID], optionCodes: ['ritiro-0', 'spedizione'] }),
    ).not.toBeNull()
  })

  it('rifiuta il pagamento al ritiro senza alcuna consegna scelta', () => {
    expect(payAtPickupViolation({ providerIds: [PAY_AT_PICKUP_PROVIDER_ID], optionCodes: [] })).not.toBeNull()
  })

  it('tratta come spedizione una consegna senza codice', () => {
    expect(payAtPickupViolation({ providerIds: [PAY_AT_PICKUP_PROVIDER_ID], optionCodes: [null] })).not.toBeNull()
  })
})
