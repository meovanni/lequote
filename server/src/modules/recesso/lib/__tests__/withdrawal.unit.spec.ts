import { createRateLimiter, renderOwnerWithdrawal, renderWithdrawalReceipt, type WithdrawalEmailData } from '../withdrawal'

describe('createRateLimiter', () => {
  it('blocca oltre il limite nella finestra e riparte dopo', () => {
    let now = 0
    const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now })
    expect(allow('ip-1')).toBe(true)
    expect(allow('ip-1')).toBe(true)
    expect(allow('ip-1')).toBe(false)
    expect(allow('ip-2')).toBe(true)
    now = 1001
    expect(allow('ip-1')).toBe(true)
  })
})

const data: WithdrawalEmailData = {
  name: 'Anna <Di Marco>',
  email: 'anna@example.com',
  orderReference: 'n. 12',
  details: 'Solo il miele',
  locale: 'it',
  submittedAt: new Date('2026-10-21T09:05:00Z'),
  matchedOrderId: 'order_1',
}

describe('ricevuta di recesso', () => {
  it('riporta il contenuto della dichiarazione con data e ora di trasmissione (art. 54-bis c.6)', () => {
    const email = renderWithdrawalReceipt(data)
    expect(email.text).toContain('n. 12')
    expect(email.text).toContain('Solo il miele')
    expect(email.text).toContain('21/10/2026')
    expect(email.text).toContain('11:05')
    expect(email.html).toContain('Anna &lt;Di Marco&gt;')
  })

  it('è nella lingua scelta dal cliente', () => {
    expect(renderWithdrawalReceipt({ ...data, locale: 'de' }).subject).toMatch(/Widerruf/)
    expect(renderWithdrawalReceipt({ ...data, locale: 'en' }).subject).toMatch(/withdrawal/i)
  })

  it('avvisa i titolari, segnalando se l’ordine non è stato riconosciuto', () => {
    expect(renderOwnerWithdrawal(data, 'https://x/app/orders/order_1').text).toContain('https://x/app/orders/order_1')
    expect(renderOwnerWithdrawal({ ...data, matchedOrderId: null }, null).text).toMatch(/non riconosciuto/i)
  })
})
