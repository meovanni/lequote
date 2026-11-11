import { toKnownCustomers } from '../bookings/customers'

const order = (id: string, created_at: string, address: Record<string, string | null>, customer: Record<string, unknown> = {}, status = 'pending') => ({
  id,
  created_at,
  status,
  email: null,
  metadata: { customer },
  shipping_address: address,
})

describe('rubrica dei clienti dagli ordini', () => {
  it('un cliente per P.IVA con i dati dell’ordine più recente; i privati per nome', () => {
    const customers = toKnownCustomers([
      order('o3', '2026-11-10', { company: 'Bottega Rossi srl', first_name: 'Mario', city: 'Teramo' }, { kind: 'azienda', vat_number: '01234567890' }),
      order('o2', '2026-11-01', { company: 'Bottega Rossi', first_name: 'Mario', city: 'Roseto' }, { kind: 'azienda', vat_number: '01234567890' }),
      order('o1', '2026-10-01', { first_name: 'gio', last_name: 'meo', phone: '333' }),
      order('o0', '2026-09-01', { first_name: '', last_name: '' }),
      order('d', '2026-09-01', { first_name: 'Bozza' }, {}, 'draft'),
    ])
    expect(customers.map((customer) => [customer.label, customer.kind, customer.city, customer.orders])).toEqual([
      ['Bottega Rossi srl (Mario)', 'azienda', 'Teramo', 2],
      ['gio meo', 'privato', '', 1],
    ])
    expect(customers[1]).toMatchObject({ first_name: 'gio', last_name: 'meo', phone: '333', vat_number: '' })
  })

  it('un ordine del sito con il nome di un cliente del gestionale non ne cambia i dati; quelli annullati non contano', () => {
    const bo = order('bo', '2026-10-01', { first_name: 'Mario', last_name: 'Rossi', phone: '333', city: 'Teramo' })
    const backOffice = { ...bo, email: 'mario@example.com', metadata: { ...bo.metadata, inserted_by: { type: 'admin', name: 'Titolare' } } }
    const site = { ...order('site', '2026-11-10', { first_name: 'Mario', last_name: 'Rossi', phone: '999', city: 'Altrove' }), email: 'altro@example.test' }
    const canceled = { ...order('x', '2026-11-11', { first_name: 'Luca', last_name: 'Bianchi' }, {}, 'canceled'), email: 'x@example.test' }
    const customers = toKnownCustomers([canceled, site, backOffice])
    expect(customers).toHaveLength(1)
    expect(customers[0]).toMatchObject({ email: 'mario@example.com', phone: '333', city: 'Teramo', orders: 2 })
  })

  it('aggiunge i clienti dell’anagrafica di Medusa senza ordini, senza doppioni', () => {
    const account = (overrides: Record<string, unknown>) => ({
      created_at: '2026-11-11',
      email: null,
      first_name: null,
      last_name: null,
      company_name: null,
      phone: null,
      metadata: null,
      addresses: [],
      ...overrides,
    })
    const customers = toKnownCustomers(
      [{ ...order('o1', '2026-10-01', { first_name: 'Gio', last_name: 'Meo' }), email: 'gio@example.com' }],
      [
        account({ first_name: 'Anna', last_name: 'Verdi', email: 'anna@example.com', addresses: [{ address_1: 'Via Roma 1', city: 'Teramo', is_default_shipping: true }] }),
        account({ company_name: 'Enoteca Blu', metadata: { vat_number: '09876543210' } }),
        account({ first_name: 'gio', last_name: 'meo' }),
        account({ first_name: 'Giovanni', email: 'GIO@example.com' }),
        account({ email: 'solo@example.com' }),
        // Registrato da sé sul sito: dati scelti da chiunque, non entra nella rubrica.
        account({ first_name: 'Anna', last_name: 'Verdi', email: 'finta@example.test', has_account: true, metadata: { vat_number: '11111111111' } }),
      ],
    )
    expect(customers.map((customer) => [customer.label, customer.kind, customer.orders])).toEqual([
      ['Anna Verdi', 'privato', 0],
      ['Enoteca Blu', 'azienda', 0],
      ['Gio Meo', 'privato', 1],
    ])
    expect(customers[0]).toMatchObject({ email: 'anna@example.com', address_1: 'Via Roma 1', city: 'Teramo' })
    expect(customers[1]).toMatchObject({ key: 'piva:09876543210', vat_number: '09876543210' })
  })
})
