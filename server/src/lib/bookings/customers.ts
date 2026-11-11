import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { BookingCustomer } from './types'

// Clienti già noti, per non riscriverne i dati a ogni nuovo ordine. Gli ordini del gestionale sono
// ordini "ospite" (Medusa non ne fa un'anagrafica), quindi la rubrica si ricava dagli ordini, con i
// dati dell'ordine più recente di ciascuno; per i titolari si aggiungono i clienti dell'anagrafica
// di Medusa (Clienti, negli strumenti avanzati, e chi si è registrato sul sito) senza ordini qui.

export type KnownCustomer = Required<{ [K in keyof BookingCustomer]: NonNullable<BookingCustomer[K]> }> & {
  key: string
  label: string
  orders: number
  lastOrderAt: string
}

type RawOrder = {
  id: string
  created_at: string | Date
  status: string
  email: string | null
  metadata: Record<string, unknown> | null
  shipping_address: Record<string, string | null> | null
}

type RawAddress = Record<string, string | null | boolean>

/** Un cliente dell'anagrafica di Medusa. */
type RawAccount = {
  created_at: string | Date
  email: string | null
  first_name: string | null
  last_name: string | null
  company_name: string | null
  phone: string | null
  metadata: Record<string, unknown> | null
  addresses?: RawAddress[] | null
}

const MAX_ORDERS = 2000
const MAX_ACCOUNTS = 2000

const clean = (value: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '')

/** Stesso cliente: la P.IVA, altrimenti il codice fiscale, altrimenti ragione sociale e nome. */
export function knownCustomerKey(customer: Pick<KnownCustomer, 'vat_number' | 'fiscal_code' | 'company' | 'first_name' | 'last_name'>): string {
  if (customer.vat_number) return `piva:${customer.vat_number.replace(/\s/g, '')}`
  if (customer.fiscal_code) return `cf:${customer.fiscal_code.replace(/\s/g, '').toUpperCase()}`
  return `nome:${[customer.company, customer.first_name, customer.last_name].map(clean).join('|').toLowerCase()}`
}

type Fields = Omit<KnownCustomer, 'kind' | 'key' | 'label' | 'orders' | 'lastOrderAt'>

function known(fields: Fields, kindHint: unknown, orders: number, at: string | Date): KnownCustomer {
  const kind = kindHint === 'azienda' || fields.company || fields.vat_number ? 'azienda' : 'privato'
  const person = [fields.first_name, fields.last_name].filter(Boolean).join(' ')
  return {
    ...fields,
    kind,
    key: knownCustomerKey(fields),
    label: fields.company ? `${fields.company}${person ? ` (${person})` : ''}` : person,
    orders,
    lastOrderAt: new Date(at).toISOString(),
  }
}

/** I dati di un cliente dell'anagrafica di Medusa: l'indirizzo di spedizione predefinito, o il primo. */
function accountFields(account: RawAccount): Fields {
  const addresses = account.addresses ?? []
  const address = addresses.find((entry) => entry.is_default_shipping) ?? addresses[0] ?? {}
  const meta = account.metadata ?? {}
  return {
    first_name: clean(account.first_name) || clean(address.first_name),
    last_name: clean(account.last_name) || clean(address.last_name),
    company: clean(account.company_name) || clean(address.company),
    vat_number: clean(meta.vat_number),
    fiscal_code: clean(meta.fiscal_code),
    email: clean(account.email),
    phone: clean(account.phone) || clean(address.phone),
    address_1: clean(address.address_1),
    postal_code: clean(address.postal_code),
    city: clean(address.city),
    province: clean(address.province),
  }
}

/**
 * Un cliente per chiave, con i dati dell'ordine più recente (gli ordini arrivano dal più recente);
 * poi i clienti dell'anagrafica di Medusa che dagli ordini non risultano (stessa chiave o email).
 */
export function toKnownCustomers(orders: RawOrder[], accounts: RawAccount[] = []): KnownCustomer[] {
  const byKey = new Map<string, KnownCustomer>()
  for (const order of orders) {
    if (order.status === 'draft') continue
    const address = order.shipping_address ?? {}
    const meta = (order.metadata?.customer ?? {}) as Record<string, unknown>
    const fields = {
      first_name: clean(address.first_name),
      last_name: clean(address.last_name),
      company: clean(address.company),
      vat_number: clean(meta.vat_number),
      fiscal_code: clean(meta.fiscal_code),
      email: clean(order.email),
      phone: clean(address.phone),
      address_1: clean(address.address_1),
      postal_code: clean(address.postal_code),
      city: clean(address.city),
      province: clean(address.province),
    }
    if (!fields.first_name && !fields.last_name && !fields.company) continue
    const key = knownCustomerKey(fields)
    const existing = byKey.get(key)
    byKey.set(key, existing ? { ...existing, orders: existing.orders + 1 } : known(fields, meta.kind, 1, order.created_at))
  }
  const emails = new Set([...byKey.values()].map((entry) => entry.email.toLowerCase()).filter(Boolean))
  for (const account of accounts) {
    const fields = accountFields(account)
    if (!fields.first_name && !fields.last_name && !fields.company) continue
    const customer = known(fields, account.metadata?.kind, 0, account.created_at)
    if (byKey.has(customer.key) || (fields.email && emails.has(fields.email.toLowerCase()))) continue
    byKey.set(customer.key, customer)
  }
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, 'it'))
}

/**
 * La rubrica: per i titolari tutti gli ordini più l'anagrafica di Medusa; per un agente
 * (orderIds) solo i clienti dei suoi ordini.
 */
export async function knownCustomers(container: MedusaContainer, orderIds?: string[]): Promise<KnownCustomer[]> {
  if (orderIds && orderIds.length === 0) return []
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [orders, accounts] = await Promise.all([
    query.graph({
      entity: 'order',
      fields: ['id', 'created_at', 'status', 'email', 'metadata', 'shipping_address.*'],
      filters: orderIds ? { id: orderIds } : {},
      pagination: { take: MAX_ORDERS, order: { created_at: 'DESC' } },
    }),
    orderIds
      ? Promise.resolve({ data: [] })
      : query.graph({
          entity: 'customer',
          fields: ['created_at', 'email', 'first_name', 'last_name', 'company_name', 'phone', 'metadata', 'addresses.*'],
          pagination: { take: MAX_ACCOUNTS, order: { created_at: 'DESC' } },
        }),
  ])
  return toKnownCustomers(orders.data as unknown as RawOrder[], accounts.data as unknown as RawAccount[])
}
