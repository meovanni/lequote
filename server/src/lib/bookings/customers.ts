import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { BookingCustomer } from './types'

// Clienti già visti negli ordini, per non riscriverne i dati a ogni nuovo ordine: Medusa non ha
// un'anagrafica per gli ordini del gestionale (sono ordini "ospite"), quindi la rubrica si ricava
// dagli ordini stessi, con i dati dell'ordine più recente di ciascuno.

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

const MAX_ORDERS = 2000

const clean = (value: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '')

/** Stesso cliente: la P.IVA, altrimenti il codice fiscale, altrimenti ragione sociale e nome. */
export function knownCustomerKey(customer: Pick<KnownCustomer, 'vat_number' | 'fiscal_code' | 'company' | 'first_name' | 'last_name'>): string {
  if (customer.vat_number) return `piva:${customer.vat_number.replace(/\s/g, '')}`
  if (customer.fiscal_code) return `cf:${customer.fiscal_code.replace(/\s/g, '').toUpperCase()}`
  return `nome:${[customer.company, customer.first_name, customer.last_name].map(clean).join('|').toLowerCase()}`
}

/** Un cliente per chiave, con i dati dell'ordine più recente; gli ordini arrivano dal più recente. */
export function toKnownCustomers(orders: RawOrder[]): KnownCustomer[] {
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
    const known = byKey.get(key)
    if (known) {
      byKey.set(key, { ...known, orders: known.orders + 1 })
      continue
    }
    const kind = meta.kind === 'azienda' || fields.company ? 'azienda' : 'privato'
    const person = [fields.first_name, fields.last_name].filter(Boolean).join(' ')
    byKey.set(key, {
      ...fields,
      kind,
      key,
      label: fields.company ? `${fields.company}${person ? ` (${person})` : ''}` : person,
      orders: 1,
      lastOrderAt: new Date(order.created_at).toISOString(),
    })
  }
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, 'it'))
}

/** La rubrica dagli ordini: tutti per i titolari, solo i propri per un agente (orderIds). */
export async function knownCustomers(container: MedusaContainer, orderIds?: string[]): Promise<KnownCustomer[]> {
  if (orderIds && orderIds.length === 0) return []
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: 'order',
    fields: ['id', 'created_at', 'status', 'email', 'metadata', 'shipping_address.*'],
    filters: orderIds ? { id: orderIds } : {},
    pagination: { take: MAX_ORDERS, order: { created_at: 'DESC' } },
  })
  return toKnownCustomers(data as unknown as RawOrder[])
}
