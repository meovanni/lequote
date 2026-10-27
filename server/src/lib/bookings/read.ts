import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { VENDITE_MODULE } from '../../modules/vendite'
import { balanceDue, customerLabel, rankAgents, summarizeSales, type SaleOrder } from '../../modules/vendite/lib/sales'
import type VenditeModuleService from '../../modules/vendite/service'
import { deliveryOf } from '../magazzino'

export type Period = { from?: Date; to?: Date }

const ORDER_FIELDS = [
  'id',
  'display_id',
  'created_at',
  'status',
  'total',
  'email',
  'metadata',
  'shipping_address.first_name',
  'shipping_address.last_name',
  'shipping_address.company',
  'shipping_address.phone',
  'shipping_methods.name',
  'items.id',
  'items.variant_id',
  'items.variant_sku',
  'items.title',
  'items.subtitle',
  'items.quantity',
  'items.unit_price',
  'items.total',
]

type RawOrder = {
  id: string
  display_id: number
  created_at: string | Date
  status: string
  total: number
  email: string | null
  metadata: Record<string, unknown> | null
  shipping_address: { first_name: string | null; last_name: string | null; company: string | null; phone: string | null } | null
  shipping_methods: { name: string }[] | null
  items: { id: string; variant_id: string | null; variant_sku: string | null; title: string; subtitle: string | null; quantity: number; unit_price: number; total: number }[] | null
}

export type BookingView = SaleOrder & {
  due: number
  email: string | null
  phone: string | null
  delivery: string
  notes: string | null
  insertedBy: { type: string; name: string } | null
  /** Incassi registrati, dal più recente: si correggono dalla riga e dal dettaglio. */
  payments: { id: string; amount: number; method: string; paid_at: string }[]
  /** Dati del cliente come sono sull'ordine, per correggerli dal dettaglio. */
  customerFields: { first_name: string; last_name: string; company: string }
  /** Consegna segnata nella pagina Gestione (lib/magazzino.ts); null se ancora da consegnare. */
  delivered: { at: string; by: string | null } | null
  lines: { id: string; variantId: string | null; sku: string; title: string; subtitle: string; quantity: number; unitPrice: number; total: number }[]
}

/** Ordini collegati a un agente (link agente-ordine). */
export async function agentOrderIds(container: MedusaContainer, agentId: string): Promise<string[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'sales_agent', fields: ['id', 'orders.id'], filters: { id: agentId } })
  const agent = data[0] as unknown as { orders?: ({ id: string } | null)[] | null } | undefined
  return (agent?.orders ?? []).flatMap((order) => (order ? [order.id] : []))
}

/** Ordini con incassi e residuo, dal più recente; filtrabili per periodo. */
export async function loadBookings(container: MedusaContainer, orderIds: string[], period: Period = {}): Promise<BookingView[]> {
  if (orderIds.length === 0) return []
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'order', fields: ORDER_FIELDS, filters: { id: orderIds } })
  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  const payments = await vendite.listSalePayments({ order_id: orderIds })

  return (data as unknown as RawOrder[])
    .filter((order) => inPeriod(new Date(order.created_at), period))
    .map((order) => {
      const own = payments
        .filter((payment) => payment.order_id === order.id)
        .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
      const paidAmounts = own.map((payment) => Number(payment.amount))
      const total = Number(order.total)
      const due = order.status === 'canceled' ? 0 : balanceDue(total, paidAmounts)
      const lines = (order.items ?? []).map((item) => ({
        id: item.id,
        variantId: item.variant_id,
        sku: item.variant_sku ?? '',
        title: item.title,
        subtitle: item.subtitle ?? '',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        total: Number(item.total),
      }))
      const insertedBy = order.metadata?.inserted_by as { type?: string; name?: string } | undefined
      const handedOver = deliveryOf(order.metadata)
      return {
        id: order.id,
        displayId: order.display_id,
        createdAt: new Date(order.created_at).toISOString(),
        status: order.status,
        total,
        paid: paidAmounts.reduce((sum, amount) => sum + amount, 0),
        customer: customerLabel(order.shipping_address),
        items: lines.map(({ sku, title, subtitle, quantity, total: lineTotal }) => ({ sku, title, subtitle, quantity, total: lineTotal })),
        due,
        email: order.email,
        phone: order.shipping_address?.phone ?? null,
        delivery: order.shipping_methods?.[0]?.name ?? '',
        notes: typeof order.metadata?.notes === 'string' && order.metadata.notes ? order.metadata.notes : null,
        insertedBy: insertedBy?.type ? { type: insertedBy.type, name: insertedBy.name ?? '' } : null,
        payments: own.map((payment) => ({ id: payment.id, amount: Number(payment.amount), method: payment.method, paid_at: new Date(payment.paid_at).toISOString() })),
        customerFields: {
          first_name: order.shipping_address?.first_name ?? '',
          last_name: order.shipping_address?.last_name ?? '',
          company: order.shipping_address?.company ?? '',
        },
        delivered: handedOver ? { at: handedOver.at, by: handedOver.by } : null,
        lines,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function inPeriod(date: Date, { from, to }: Period): boolean {
  return (!from || date >= from) && (!to || date <= to)
}

/** Riepilogo di ogni agente e classifica, nel periodo indicato. */
export async function salesByAgent(container: MedusaContainer, period: Period = {}) {
  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  const agents = await vendite.listSalesAgents({}, { order: { name: 'ASC' } })
  const rows = await Promise.all(
    agents.map(async (agent) => {
      const bookings = await loadBookings(container, await agentOrderIds(container, agent.id), period)
      return { agent, summary: summarizeSales(bookings) }
    }),
  )
  const ranking = rankAgents(
    rows
      .filter((row) => row.agent.active)
      .map(({ agent, summary }) => ({ agentId: agent.id, name: agent.name, revenue: summary.revenue, quantity: summary.quantity, orders: summary.orders })),
  )
  return { rows, ranking }
}
