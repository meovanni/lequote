// Conti delle vendite: saldi delle prenotazioni, riepiloghi per agente, classifica. Funzioni pure:
// i dati arrivano già letti da Medusa (lib/bookings.ts).

/** Euro in centesimi interi, per sommare senza errori di virgola mobile. */
const cents = (value: number) => Math.round(value * 100)
const euros = (value: number) => value / 100

export function balanceDue(total: number, payments: number[]): number {
  const due = cents(total) - payments.reduce((sum, amount) => sum + cents(amount), 0)
  return euros(Math.max(0, due))
}

/** Un incasso è valido se positivo e non supera il residuo dell'ordine. */
export function paymentViolation(due: number, amount: number): string | null {
  if (!(amount > 0)) return 'L’importo deve essere maggiore di zero.'
  if (cents(due) === 0) return 'L’ordine è già saldato.'
  if (cents(amount) > cents(due)) return `L’importo supera il residuo da incassare (${due.toFixed(2)} €).`
  return null
}

type Address = { company?: string | null; first_name?: string | null; last_name?: string | null } | null | undefined

/** Come si chiama il cliente nei riepiloghi: la ragione sociale per le aziende, altrimenti nome e cognome. */
export function customerLabel(address: Address): string {
  const company = address?.company?.trim()
  if (company) return company
  const name = [address?.first_name, address?.last_name].filter((part) => part?.trim()).join(' ').trim()
  return name || 'Cliente senza nome'
}

export type SaleOrder = {
  id: string
  displayId: number
  createdAt: string
  status: string
  total: number
  paid: number
  customer: string
  items: { sku: string; title: string; subtitle: string; quantity: number; total: number }[]
}

export type SalesSummary = {
  orders: number
  revenue: number
  paid: number
  outstanding: number
  quantity: number
  byProduct: { sku: string; label: string; quantity: number; total: number }[]
  byCustomer: { customer: string; orders: number; quantity: number; total: number }[]
}

/** Riepilogo di un insieme di ordini; gli annullati non contano. */
export function summarizeSales(orders: SaleOrder[]): SalesSummary {
  const active = orders.filter((order) => order.status !== 'canceled')
  const products = new Map<string, { sku: string; label: string; quantity: number; total: number }>()
  const customers = new Map<string, { customer: string; orders: number; quantity: number; total: number }>()
  let revenue = 0
  let paid = 0
  let quantity = 0

  for (const order of active) {
    revenue += cents(order.total)
    paid += cents(order.paid)
    const customer = customers.get(order.customer) ?? { customer: order.customer, orders: 0, quantity: 0, total: 0 }
    customer.orders += 1
    customer.total += cents(order.total)
    for (const item of order.items) {
      quantity += item.quantity
      customer.quantity += item.quantity
      const key = item.sku || `${item.title} ${item.subtitle}`
      const product = products.get(key) ?? { sku: item.sku, label: [item.title, item.subtitle].filter(Boolean).join(', '), quantity: 0, total: 0 }
      product.quantity += item.quantity
      product.total += cents(item.total)
      products.set(key, product)
    }
    customers.set(order.customer, customer)
  }

  const byQuantity = <T extends { quantity: number; total: number }>(a: T, b: T) => b.quantity - a.quantity || b.total - a.total
  return {
    orders: active.length,
    revenue: euros(revenue),
    paid: euros(paid),
    outstanding: euros(Math.max(0, revenue - paid)),
    quantity,
    byProduct: [...products.values()].sort(byQuantity).map((row) => ({ ...row, total: euros(row.total) })),
    byCustomer: [...customers.values()]
      .sort((a, b) => b.total - a.total || b.quantity - a.quantity)
      .map((row) => ({ ...row, total: euros(row.total) })),
  }
}

export type AgentScore = { agentId: string; name: string; revenue: number; quantity: number; orders: number }

/** Classifica degli agenti: fatturato, a parità i pezzi venduti. */
export function rankAgents(scores: AgentScore[]): (AgentScore & { position: number })[] {
  return [...scores]
    .sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity || a.name.localeCompare(b.name))
    .map((score, index) => ({ ...score, position: index + 1 }))
}

export type BookingLine = { variant_id: string; quantity: number }

/**
 * Da righe attuali a righe desiderate: quantità da cambiare (0 = riga tolta) e varianti nuove.
 * Le varianti ripetute nelle righe desiderate si sommano.
 */
export function planBookingEdit(
  current: { id: string; variant_id: string | null; quantity: number }[],
  desired: BookingLine[],
): { update: { id: string; quantity: number }[]; add: BookingLine[] } {
  const wanted = new Map<string, number>()
  for (const line of desired) wanted.set(line.variant_id, (wanted.get(line.variant_id) ?? 0) + line.quantity)

  const update: { id: string; quantity: number }[] = []
  const seen = new Set<string>()
  for (const item of current) {
    if (!item.variant_id) continue
    seen.add(item.variant_id)
    const quantity = wanted.get(item.variant_id) ?? 0
    if (quantity !== item.quantity) update.push({ id: item.id, quantity })
  }
  const add = [...wanted.entries()]
    .filter(([variantId, quantity]) => !seen.has(variantId) && quantity > 0)
    .map(([variant_id, quantity]) => ({ variant_id, quantity }))
  return { update, add }
}
