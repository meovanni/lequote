import {
  BANK_TRANSFER,
  bankTransferDetails,
  escapeHtml,
  renderCustomerConfirmation,
  renderOwnerAlert,
  toEmailLocale,
  type OrderEmailData,
} from '../order-emails'

const order: OrderEmailData = {
  code: 'BBTHK26',
  email: 'anna@example.com',
  customerName: 'Anna <Di Marco>',
  phone: '3330000000',
  locale: 'it',
  lines: [
    { sku: 'OLIO-750ML', title: 'Olio Extravergine', subtitle: 'Bottiglia 750 ml', quantity: 2, total: 30 },
    { sku: 'MIELE-250G', title: 'Miele', subtitle: 'Vasetto 250 g', quantity: 1, total: 5 },
  ],
  itemTotal: 35,
  shippingTotal: 0,
  taxTotal: 1.61,
  total: 35,
  deliveryName: 'Ritiro a Roseto degli Abruzzi',
  address: '',
  paymentMethod: 'bonifico',
}

describe('toEmailLocale', () => {
  it('riduce il tag alla lingua e ricade sull’italiano', () => {
    expect(toEmailLocale('de-DE')).toBe('de')
    expect(toEmailLocale('en')).toBe('en')
    expect(toEmailLocale('fr')).toBe('it')
    expect(toEmailLocale(null)).toBe('it')
  })
})

describe('bankTransferDetails', () => {
  it('usa IBAN e intestatario pubblicati dal back office, altrimenti quelli di partenza', () => {
    expect(bankTransferDetails({ 'business.BANK_TRANSFER.iban': 'IT60X0542811101000000123456' })).toEqual({
      holder: BANK_TRANSFER.holder,
      iban: 'IT60X0542811101000000123456',
    })
    const email = renderCustomerConfirmation(order, { holder: 'Le Quote S.S.', iban: 'IT60X0542811101000000123456' })
    expect(email.text).toContain('IBAN: IT60X0542811101000000123456')
    expect(email.text).toContain('Le Quote S.S.')
  })
})

describe('renderCustomerConfirmation', () => {
  it('porta alla funzione di recesso con la dicitura di legge, se il link è noto', () => {
    const withLink = renderCustomerConfirmation({ ...order, withdrawalUrl: 'https://le-quote.it/recesso?ordine=BBTHK26' })
    expect(withLink.text).toContain('recedere dal contratto qui, https://le-quote.it/recesso?ordine=BBTHK26')
    expect(renderCustomerConfirmation(order).text).not.toContain('recedere')
  })

  it('in italiano riporta numero, prodotti, totale e coordinate del bonifico', () => {
    const email = renderCustomerConfirmation(order)
    expect(email.subject).toContain('n. BBTHK26')
    expect(email.text).toContain('2 × Olio Extravergine, Bottiglia 750 ml')
    expect(email.text).toMatch(/Totale: 35,00\s€/)
    // Senza IBAN inserito dai titolari: gli estremi arrivano dopo la conferma.
    expect(BANK_TRANSFER.iban).toBe('')
    expect(email.text).not.toContain('IBAN')
    expect(email.text).toContain("Gli estremi per il pagamento ti saranno forniti a seguito della conferma dell'ordine.")
    expect(email.text).toContain('Causale: Ordine BBTHK26 Le Quote')
    expect(email.text).toContain('Orari: [da confermare]')
  })

  it('traduce testi e nomi dei prodotti per chi ha ordinato in tedesco', () => {
    const email = renderCustomerConfirmation({ ...order, locale: 'de', paymentMethod: 'ritiro' })
    expect(email.subject).toContain('Bestellung Nr. BBTHK26')
    expect(email.text).toContain('Natives Olivenöl extra, Flasche 750 ml')
    expect(email.text).toContain('Abholung in Roseto degli Abruzzi')
    expect(email.text).toContain('bei der Abholung')
    expect(email.text).not.toContain('IBAN')
  })

  it('non mostra la nota di ritiro per le spedizioni', () => {
    const email = renderCustomerConfirmation({ ...order, address: 'Via Nazionale 1, 64026 Roseto degli Abruzzi (TE)' })
    expect(email.text).toContain('Indirizzo: Via Nazionale 1')
    expect(email.text).not.toContain('pronto per il ritiro')
  })

  it('protegge l’HTML dai dati inseriti dal cliente', () => {
    const email = renderCustomerConfirmation(order)
    expect(email.html).toContain('Anna &lt;Di Marco&gt;')
    expect(email.html).not.toContain('<Di Marco>')
  })
})

describe('renderOwnerAlert', () => {
  it('riassume cliente, pagamento e link al gestionale', () => {
    const email = renderOwnerAlert(order, 'http://localhost:9000/app/orders/order_1')
    expect(email.subject).toMatch(/Nuovo ordine n\. BBTHK26: 35,00\s€, Anna/)
    expect(email.text).toContain('Pagamento: Bonifico bancario')
    expect(email.text).toContain('anna@example.com, 3330000000')
    expect(email.text).toContain('http://localhost:9000/app/orders/order_1')
  })
})

describe('escapeHtml', () => {
  it('neutralizza i caratteri speciali', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
  })
})

describe('renderOwnerAlert, ordini del gestionale', () => {
  it('dice chi ha inserito l’ordine e dove si registrano gli incassi', () => {
    const email = renderOwnerAlert({ ...order, paymentMethod: null, insertedBy: 'Bruno' }, 'https://le-quote.it/app/orders/order_1')
    expect(email.text).toContain('inserito da Bruno')
    expect(email.text).toContain('incassi registrati nel gestionale')
  })
})
