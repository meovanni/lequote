// Rubrica dei clienti già visti negli ordini: chi corrisponde a quello che si sta scrivendo.

export type KnownCustomer = {
  key: string
  label: string
  kind: 'privato' | 'azienda'
  first_name: string
  last_name: string
  company: string
  vat_number: string
  fiscal_code: string
  email: string
  phone: string
  address_1: string
  postal_code: string
  city: string
  province: string
  orders: number
}

export type TypedCustomer = Pick<KnownCustomer, 'first_name' | 'last_name' | 'company' | 'vat_number' | 'phone'>

const MAX_RESULTS = 5
const MIN_WORD = 2

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const haystack = (customer: KnownCustomer) =>
  normalize([customer.label, customer.first_name, customer.last_name, customer.company, customer.vat_number, customer.fiscal_code, customer.phone.replace(/\s/g, ''), customer.email].join(' '))

/**
 * I clienti noti che corrispondono ai dati scritti nel modulo (nome, cognome, ragione sociale,
 * P.IVA, telefono): ogni parola di almeno due lettere deve comparire nei dati del cliente.
 */
export function matchKnownCustomers(customers: KnownCustomer[], typed: TypedCustomer, exclude?: string | null): KnownCustomer[] {
  const words = normalize([typed.company, typed.vat_number, typed.first_name, typed.last_name, typed.phone.replace(/\s/g, '')].join(' '))
    .split(/\s+/)
    .filter((word) => word.length >= MIN_WORD)
  if (words.length === 0) return []
  return customers
    .filter((customer) => customer.key !== exclude)
    .filter((customer) => {
      const text = haystack(customer)
      return words.every((word) => text.includes(word))
    })
    .slice(0, MAX_RESULTS)
}
