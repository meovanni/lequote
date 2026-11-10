import { matchKnownCustomers, type KnownCustomer } from '../known-customers'

const customer = (overrides: Partial<KnownCustomer>): KnownCustomer => ({
  key: 'nome:x',
  label: '',
  kind: 'privato',
  first_name: '',
  last_name: '',
  company: '',
  vat_number: '',
  fiscal_code: '',
  email: '',
  phone: '',
  address_1: '',
  postal_code: '',
  city: '',
  province: '',
  orders: 1,
  ...overrides,
})

const mario = customer({ key: 'cf:RSSMRA', label: 'Mario Rossi', first_name: 'Mario', last_name: 'Rossi', phone: '333 123 4567' })
const bottega = customer({ key: 'piva:01234567890', kind: 'azienda', label: 'Bottega Niccolò srl (Anna Verdi)', company: 'Bottega Niccolò srl', vat_number: '01234567890', first_name: 'Anna', last_name: 'Verdi' })
const all = [mario, bottega]
const typed = (overrides: Partial<Record<'first_name' | 'last_name' | 'company' | 'vat_number' | 'phone', string>>) => ({
  first_name: '',
  last_name: '',
  company: '',
  vat_number: '',
  phone: '',
  ...overrides,
})

describe('clienti già noti mentre si scrive', () => {
  it('trova il cliente dal nome, anche solo l’inizio, senza badare a maiuscole e accenti', () => {
    expect(matchKnownCustomers(all, typed({ first_name: 'mar' }))).toEqual([mario])
    expect(matchKnownCustomers(all, typed({ company: 'bottega niccolo' }))).toEqual([bottega])
    expect(matchKnownCustomers(all, typed({ first_name: 'Mario', last_name: 'Ro' }))).toEqual([mario])
  })

  it('trova il cliente dalla partita IVA o dal telefono scritto senza spazi', () => {
    expect(matchKnownCustomers(all, typed({ vat_number: '0123456' }))).toEqual([bottega])
    expect(matchKnownCustomers(all, typed({ phone: '3331234' }))).toEqual([mario])
  })

  it('niente suggerimenti con una sola lettera, con dati che non corrispondono o per il cliente già scelto', () => {
    expect(matchKnownCustomers(all, typed({ first_name: 'm' }))).toEqual([])
    expect(matchKnownCustomers(all, typed({ first_name: 'Mario', last_name: 'Bianchi' }))).toEqual([])
    expect(matchKnownCustomers(all, typed({ first_name: 'Mario' }), mario.key)).toEqual([])
  })
})
