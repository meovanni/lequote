import { buildDdt, buildInvoice, customerKey, defaultPackages, documentLabel, documentYear, invoiceBlocker, missingForDdt, missingForInvoice } from '../build'
import { renderDdt, renderInvoice } from '../pdf'
import type { Party, Seller, SourceOrder } from '../types'

const seller: Seller = { name: 'Le Quote', address: 'Via del Sottopassaggio 1, Roseto', vat: '02173860673', email: 'info@le-quote.it', pec: '', phone: '', iban: 'IT60X0542811101000000123456', bankHolder: 'Claudia Pallitti' }

const azienda: Party = {
  kind: 'azienda',
  name: 'Bottega Rossi srl',
  address: 'Via Roma 1',
  postalCode: '64026',
  city: 'Roseto degli Abruzzi',
  province: 'te',
  vat: '01234567890',
  fiscalCode: '',
  sdiCode: '',
  pec: '',
  email: '',
  phone: '',
}

const order = (overrides: Partial<SourceOrder> = {}): SourceOrder => ({
  id: 'order_1',
  code: 'H3E5C26',
  createdAt: '2026-11-02T10:00:00.000Z',
  status: 'completed',
  delivered: true,
  customer: azienda,
  items: [
    // 12 € IVA 4% inclusa a bottiglia, 2 bottiglie; 9 € IVA 10% il vasetto.
    { sku: 'OLIO-750ML', title: 'Olio extravergine di oliva', subtitle: 'Bottiglia 750 ml', quantity: 2, unit: 'pz', total: 24, taxTotal: 0.92, rate: 4 },
    { sku: 'MIELE-500G', title: 'Miele', subtitle: 'Vasetto 500 g', quantity: 1, unit: 'pz', total: 9, taxTotal: 0.82, rate: 10 },
    { sku: 'OLIO-SFUSO', title: 'Olio extravergine di oliva', subtitle: 'Da imbottigliare', quantity: 10, unit: 'L', total: 140, taxTotal: 5.38, rate: 4 },
  ],
  shipping: [{ name: 'Consegna a cura dell’agente', total: 0, taxTotal: 0, rate: 22 }],
  total: 173,
  paid: 50,
  paymentMethod: 'Contanti',
  ...overrides,
})

describe('dati obbligatori', () => {
  it('fattura: azienda con P.IVA e indirizzo completo; privato con codice fiscale', () => {
    expect(missingForInvoice(azienda)).toEqual([])
    expect(missingForInvoice({ ...azienda, vat: '123', postalCode: '' })).toEqual(['partita IVA (11 cifre)', 'CAP'])
    expect(missingForInvoice({ ...azienda, kind: 'privato', name: 'Mario Rossi', vat: '' })).toEqual(['codice fiscale (16 caratteri)'])
    expect(missingForInvoice({ ...azienda, sdiCode: 'ABC' })).toEqual(['codice destinatario SDI valido (7 caratteri)'])
  })

  it('DDT: destinatario e luogo di consegna', () => {
    expect(missingForDdt({ ...azienda, address: '' }, '')).toEqual(['indirizzo o luogo di destinazione'])
    expect(missingForDdt({ ...azienda, address: '' }, 'Mercato di Teramo')).toEqual([])
  })
})

describe('cliente', () => {
  it('lo riconosce dalla P.IVA, poi dal codice fiscale, poi dal nome', () => {
    expect(customerKey(azienda)).toBe('piva:01234567890')
    expect(customerKey({ vat: '', fiscalCode: 'rssmra80a01h501u', name: 'Mario' })).toBe('cf:RSSMRA80A01H501U')
    expect(customerKey({ vat: '', fiscalCode: '', name: ' Mario  Rossi ' })).toBe('nome:mario rossi')
  })
})

describe('numeri e date', () => {
  it('etichetta e anno all’ora italiana', () => {
    expect(documentLabel('ddt', 3, 2026, '2026-11-10T09:00:00Z')).toBe('DDT n. 3/2026 del 10/11/2026')
    expect(documentYear(new Date('2026-12-31T23:30:00Z'))).toBe(2027)
  })
})

describe('DDT', () => {
  it('righe senza prezzi, lotti per riga, colli contati sui pezzi', () => {
    const ddt = buildDdt(order(), { recipient: azienda, transportStart: new Date('2026-11-10T08:00:00Z'), lots: ['L011026', '', 'L011026'] }, seller)
    expect(ddt.lines).toEqual([
      { description: 'Olio extravergine di oliva - Bottiglia 750 ml', quantity: 2, unit: 'pz', lot: 'L011026' },
      { description: 'Miele - Vasetto 500 g', quantity: 1, unit: 'pz', lot: '' },
      { description: 'Olio extravergine di oliva - Da imbottigliare', quantity: 10, unit: 'L', lot: 'L011026' },
    ])
    expect(ddt.reason).toBe('Vendita')
    expect(ddt.carrier).toBe('mittente')
    expect(ddt.recipient.province).toBe('TE')
    expect(defaultPackages(order())).toBe(3)
  })
})

describe('fattura', () => {
  it('imponibile e IVA per aliquota come li ha calcolati Medusa, pagato e residuo', () => {
    const invoice = buildInvoice([order()], new Map([['order_1', 'DDT n. 1/2026 del 10/11/2026']]), { customer: azienda }, seller)
    expect(invoice.lines.map((line) => [line.net, line.vat, line.vatRate])).toEqual([
      [23.08, 0.92, 4],
      [8.18, 0.82, 10],
      [134.62, 5.38, 4],
    ])
    expect(invoice.lines[0].unitNet).toBe(11.54)
    expect(invoice.lines[0].reference).toBe('DDT n. 1/2026 del 10/11/2026')
    expect(invoice.vatSummary).toEqual([
      { rate: 4, net: 157.7, vat: 6.3 },
      { rate: 10, net: 8.18, vat: 0.82 },
    ])
    expect([invoice.netTotal, invoice.vatTotal, invoice.total, invoice.paid, invoice.due]).toEqual([165.88, 7.12, 173, 50, 123])
    expect(invoice.ddtReferences).toEqual(['DDT n. 1/2026 del 10/11/2026'])
  })

  it('spedizione a pagamento come riga a sé; senza DDT la riga richiama l’ordine', () => {
    const invoice = buildInvoice([order({ shipping: [{ name: 'Corriere', total: 12.2, taxTotal: 2.2, rate: 22 }] })], new Map(), { customer: azienda }, seller)
    expect(invoice.lines.at(-1)).toMatchObject({ description: 'Spedizione - Corriere', net: 10, vat: 2.2, vatRate: 22, reference: 'Ordine H3E5C26' })
    expect(invoice.ddtReferences).toEqual([])
  })

  it('un solo cliente, ordini non annullati e non già fatturati', () => {
    expect(invoiceBlocker([order(), order({ id: 'order_2', customer: { ...azienda, vat: '09876543210' } })], new Set())).toMatch(/clienti diversi/)
    expect(invoiceBlocker([order({ status: 'canceled' })], new Set())).toMatch(/annullato/)
    expect(invoiceBlocker([order()], new Set(['order_1']))).toMatch(/già in una fattura/)
    expect(invoiceBlocker([order()], new Set())).toBeNull()
  })
})

describe('PDF', () => {
  const issued = { id: 'doc_1', year: 2026, number: 7, issued_at: '2026-11-10T09:00:00Z', status: 'issued' as const }

  it('DDT e fattura escono come PDF validi, anche con molte righe su più pagine', async () => {
    const many = order({ items: Array.from({ length: 60 }, (_, index) => ({ ...order().items[0], subtitle: `Bottiglia ${index}` })) })
    const ddt = await renderDdt({ ...issued, kind: 'ddt', data: buildDdt(many, { recipient: azienda, transportStart: new Date() }, seller) })
    const invoice = await renderInvoice({ ...issued, kind: 'fattura', status: 'canceled', data: buildInvoice([many], new Map(), { customer: azienda }, seller) })
    for (const file of [ddt, invoice]) {
      expect(file.subarray(0, 5).toString()).toBe('%PDF-')
      expect((file.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThan(1)
    }
  })
})
