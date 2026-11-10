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
})
