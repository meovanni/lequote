import { backofficePaymentViolation, BACKOFFICE_PROVIDER_ID } from '../checkout-rules'
import { signBackofficeCart, verifyBackofficeCart } from '../backoffice-signature'

describe('firma dei carrelli del gestionale', () => {
  const secret = 'segreto-di-prova'

  it('riconosce la firma fatta dal server per quel carrello', () => {
    const signature = signBackofficeCart('cart_1', secret)
    expect(verifyBackofficeCart('cart_1', signature, secret)).toBe(true)
  })

  it('rifiuta la firma di un altro carrello, una firma inventata o mancante', () => {
    const signature = signBackofficeCart('cart_1', secret)
    expect(verifyBackofficeCart('cart_2', signature, secret)).toBe(false)
    expect(verifyBackofficeCart('cart_1', 'abc', secret)).toBe(false)
    expect(verifyBackofficeCart('cart_1', undefined, secret)).toBe(false)
    expect(verifyBackofficeCart('cart_1', signature, 'altro-segreto')).toBe(false)
  })
})

describe('backofficePaymentViolation', () => {
  it('il pagamento del gestionale vale solo per i carrelli firmati dal server', () => {
    expect(backofficePaymentViolation({ providerIds: [BACKOFFICE_PROVIDER_ID], signed: false })).toMatch(/gestionale/)
    expect(backofficePaymentViolation({ providerIds: [BACKOFFICE_PROVIDER_ID], signed: true })).toBeNull()
    expect(backofficePaymentViolation({ providerIds: ['pp_bonifico_lequote'], signed: false })).toBeNull()
  })
})
