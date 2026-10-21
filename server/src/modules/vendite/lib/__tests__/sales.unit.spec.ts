import { balanceDue, customerLabel, paymentViolation, planBookingEdit, rankAgents, summarizeSales, type SaleOrder } from '../sales'

const order = (overrides: Partial<SaleOrder>): SaleOrder => ({
  id: 'order_1',
  displayId: 1,
  createdAt: '2026-10-01T10:00:00Z',
  status: 'pending',
  total: 30,
  paid: 0,
  customer: 'Anna Di Marco',
  items: [{ sku: 'OLIO-750ML', title: 'Olio Extravergine', subtitle: 'Bottiglia 750 ml', quantity: 2, total: 30 }],
  ...overrides,
})

describe('balanceDue', () => {
  it('sottrae gli incassi dal totale, senza scendere sotto zero né perdere centesimi', () => {
    expect(balanceDue(30, [10, 5.1])).toBeCloseTo(14.9, 2)
    expect(balanceDue(30, [30])).toBe(0)
    expect(balanceDue(0.3, [0.1, 0.2])).toBe(0)
  })
})

describe('paymentViolation', () => {
  it('accetta un acconto o il saldo', () => {
    expect(paymentViolation(30, 10)).toBeNull()
    expect(paymentViolation(30, 30)).toBeNull()
  })

  it('rifiuta importi nulli, negativi o oltre il residuo', () => {
    expect(paymentViolation(30, 0)).toMatch(/maggiore di zero/)
    expect(paymentViolation(30, -5)).toMatch(/maggiore di zero/)
    expect(paymentViolation(30, 30.01)).toMatch(/residuo/)
    expect(paymentViolation(0, 1)).toMatch(/già saldato/)
  })
})

describe('customerLabel', () => {
  it('usa la ragione sociale per le aziende e nome e cognome per i privati', () => {
    expect(customerLabel({ company: 'Bottega Rossi srl', first_name: 'Mario', last_name: 'Rossi' })).toBe('Bottega Rossi srl')
    expect(customerLabel({ company: null, first_name: 'Anna', last_name: 'Di Marco' })).toBe('Anna Di Marco')
    expect(customerLabel(null)).toBe('Cliente senza nome')
  })
})

describe('summarizeSales', () => {
  const orders = [
    order({ id: 'o1', total: 30, paid: 30 }),
    order({
      id: 'o2',
      customer: 'Bottega Rossi srl',
      total: 45,
      paid: 10,
      items: [
        { sku: 'OLIO-750ML', title: 'Olio Extravergine', subtitle: 'Bottiglia 750 ml', quantity: 1, total: 15 },
        { sku: 'MIELE-500G', title: 'Miele', subtitle: 'Vasetto 500 g', quantity: 3, total: 30 },
      ],
    }),
    order({ id: 'o3', status: 'canceled', total: 100, paid: 0 }),
  ]

  it('somma ordini, incassi e residuo, escludendo gli annullati', () => {
    const summary = summarizeSales(orders)
    expect(summary.orders).toBe(2)
    expect(summary.revenue).toBe(75)
    expect(summary.paid).toBe(40)
    expect(summary.outstanding).toBe(35)
    expect(summary.quantity).toBe(6)
  })

  it('raggruppa le quantità per prodotto e per cliente, dal più venduto', () => {
    const summary = summarizeSales(orders)
    expect(summary.byProduct).toEqual([
      { sku: 'OLIO-750ML', label: 'Olio Extravergine, Bottiglia 750 ml', quantity: 3, total: 45 },
      { sku: 'MIELE-500G', label: 'Miele, Vasetto 500 g', quantity: 3, total: 30 },
    ])
    expect(summary.byCustomer).toEqual([
      { customer: 'Bottega Rossi srl', orders: 1, quantity: 4, total: 45 },
      { customer: 'Anna Di Marco', orders: 1, quantity: 2, total: 30 },
    ])
  })
})

describe('rankAgents', () => {
  it('ordina per fatturato, poi per pezzi, e numera le posizioni', () => {
    const ranking = rankAgents([
      { agentId: 'a', name: 'Bruno', revenue: 100, quantity: 5, orders: 2 },
      { agentId: 'b', name: 'Giulia', revenue: 200, quantity: 4, orders: 1 },
      { agentId: 'c', name: 'Luciana', revenue: 100, quantity: 9, orders: 3 },
    ])
    expect(ranking.map((row) => [row.position, row.name])).toEqual([
      [1, 'Giulia'],
      [2, 'Luciana'],
      [3, 'Bruno'],
    ])
  })
})

describe('planBookingEdit', () => {
  const current = [
    { id: 'item_1', variant_id: 'var_olio', quantity: 2 },
    { id: 'item_2', variant_id: 'var_miele', quantity: 1 },
  ]

  it('cambia le quantità, toglie le righe sparite e aggiunge le varianti nuove', () => {
    expect(
      planBookingEdit(current, [
        { variant_id: 'var_olio', quantity: 3 },
        { variant_id: 'var_latta', quantity: 1 },
      ]),
    ).toEqual({ update: [{ id: 'item_1', quantity: 3 }, { id: 'item_2', quantity: 0 }], add: [{ variant_id: 'var_latta', quantity: 1 }] })
  })

  it('non tocca le righe invariate e somma le varianti ripetute', () => {
    expect(
      planBookingEdit(current, [
        { variant_id: 'var_olio', quantity: 1 },
        { variant_id: 'var_olio', quantity: 1 },
        { variant_id: 'var_miele', quantity: 1 },
      ]),
    ).toEqual({ update: [], add: [] })
  })
})
