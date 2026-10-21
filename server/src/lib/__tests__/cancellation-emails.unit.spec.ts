import { renderCustomerCancellation, renderOwnerCancellation } from '../cancellation-emails'
import type { OrderEmailData } from '../order-emails'

const order: OrderEmailData = {
  displayId: 12,
  email: 'anna@example.com',
  customerName: 'Anna <Di Marco>',
  phone: '3330000000',
  locale: 'de',
  lines: [{ sku: 'OLIO-750ML', title: 'Olio Extravergine', subtitle: 'Bottiglia 750 ml', quantity: 2, total: 30 }],
  itemTotal: 30,
  shippingTotal: 0,
  taxTotal: 1.15,
  total: 30,
  deliveryName: 'Ritiro a Cerchio',
  address: '',
  paymentMethod: 'bonifico',
}

describe('email di annullamento per bonifico non ricevuto', () => {
  it('scrive al cliente nella sua lingua, con il numero d’ordine e i giorni del termine', () => {
    const email = renderCustomerCancellation(order, 7)
    expect(email.subject).toContain('12')
    expect(email.text).toContain('7')
    expect(email.text).toMatch(/storniert/i)
    expect(email.html).toContain('Anna &lt;Di Marco&gt;')
  })

  it('avvisa i titolari in italiano con il link all’ordine', () => {
    const email = renderOwnerCancellation(order, 7, 'https://lequote.it/app/orders/order_1')
    expect(email.subject).toMatch(/annullato/i)
    expect(email.text).toContain('https://lequote.it/app/orders/order_1')
    expect(email.text).toContain('anna@example.com')
  })

  it('avvisa i titolari anche se il cliente non ha lasciato l’email', () => {
    const email = renderOwnerCancellation({ ...order, email: '' }, 7, 'https://lequote.it/app/orders/order_1')
    expect(email.text).toMatch(/nessuna email/i)
  })
})
