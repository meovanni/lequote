import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MathBN, MedusaError, Modules } from '@medusajs/framework/utils'
import { MAGAZZINO_MODULE } from '../modules/magazzino'
import { LINE_UNIT, formatOf } from '../modules/magazzino/lib/formats'
import { availabilityBySku, deliveryMovements, shortfalls, stockOverview, type Counts, type Line } from '../modules/magazzino/lib/stock'
import type MagazzinoModuleService from '../modules/magazzino/service'

// Il magazzino visto dagli ordini (modules/magazzino): gli ordini aperti impegnano la merce, la
// consegna la scala. Un ordine è aperto finché non è annullato né consegnato; la consegna si segna
// in metadata.delivered, con le variazioni fatte, così si può annullare. Lo stato Medusa dell'ordine
// non cambia: "completato" non si potrebbe più riaprire.

type OrderRow = {
  id: string
  status: string
  metadata: Record<string, unknown> | null
  items: { variant_sku: string | null; quantity: unknown }[] | null
}

export type Delivery = { at: string; by: string | null; movements: { sku: string; delta: number }[] }

const magazzino = (container: MedusaContainer): MagazzinoModuleService => container.resolve(MAGAZZINO_MODULE)

export const deliveryOf = (metadata: Record<string, unknown> | null | undefined): Delivery | null =>
  (metadata?.delivered as Delivery | undefined)?.at ? (metadata!.delivered as Delivery) : null

const isOpen = (order: OrderRow) => order.status !== 'canceled' && order.status !== 'draft' && !deliveryOf(order.metadata)

const linesOf = (order: OrderRow): Line[] =>
  (order.items ?? []).flatMap((item) =>
    formatOf(item.variant_sku) ? [{ sku: item.variant_sku!, quantity: MathBN.convert(item.quantity as number).toNumber() }] : [],
  )

async function orders(container: MedusaContainer, filters: Record<string, unknown> = {}): Promise<OrderRow[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  // 'items.quantity' da solo torna vuoto: la quantità arriva con 'items.*'.
  const { data } = await query.graph({ entity: 'order', fields: ['id', 'status', 'metadata', 'items.*'], filters })
  return data as unknown as OrderRow[]
}

/** Righe di tutti gli ordini aperti, tranne quello indicato (in una modifica). */
export async function openLines(container: MedusaContainer, exceptOrderId?: string): Promise<Line[]> {
  const rows = await orders(container, { status: { $nin: ['canceled', 'draft'] } })
  return rows.filter((order) => order.id !== exceptOrderId && isOpen(order)).flatMap(linesOf)
}

export async function stockState(container: MedusaContainer) {
  const [counts, open] = await Promise.all([magazzino(container).currentCounts(), openLines(container)])
  return { counts, lines: stockOverview(counts, open), available: availabilityBySku(counts, open) }
}

/** Pezzi (o litri e chili) ordinabili per SKU, come li vedono sito e gestionale. */
export async function availability(container: MedusaContainer): Promise<Record<string, number>> {
  return (await stockState(container)).available
}

async function skusOf(container: MedusaContainer, variantIds: string[]): Promise<Map<string, string>> {
  if (variantIds.length === 0) return new Map()
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'product_variant', fields: ['id', 'sku'], filters: { id: variantIds } })
  return new Map((data as unknown as { id: string; sku: string | null }[]).flatMap((row) => (row.sku ? [[row.id, row.sku] as const] : [])))
}

export function shortfallMessage(missing: { sku: string; requested: number; available: number }[]): string {
  const parts = missing.map(({ sku, requested, available }) => {
    const format = formatOf(sku)!
    const unit = format.bulk ? ` ${LINE_UNIT[format.line]}` : ''
    const name = format.bulk ? (format.line === 'olio' ? 'Olio da imbottigliare' : 'Miele da invasettare') : format.label
    return `${name} (richiesti ${requested}${unit}, ${available > 0 ? `disponibili ${available}${unit}` : 'esaurito'})`
  })
  return `Disponibilità insufficiente: ${parts.join('; ')}.`
}

/**
 * Ferma un ordine (o una modifica, con `exceptOrderId`) che chiede più di quanto il magazzino può
 * dare: pezzi pronti liberi più quello che si confeziona dallo sfuso libero.
 */
export async function assertAvailable(
  container: MedusaContainer,
  items: { variant_id?: string; sku?: string | null; quantity: number }[],
  exceptOrderId?: string,
): Promise<void> {
  const skus = await skusOf(container, items.flatMap((item) => (item.variant_id && !item.sku ? [item.variant_id] : [])))
  const request = items.flatMap((item) => {
    const sku = item.sku ?? (item.variant_id ? skus.get(item.variant_id) : undefined)
    return sku ? [{ sku, quantity: item.quantity }] : []
  })
  const [counts, open] = await Promise.all([magazzino(container).currentCounts(), openLines(container, exceptOrderId)])
  const missing = shortfalls(counts, open, request)
  if (missing.length > 0) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, shortfallMessage(missing))
}

async function oneOrder(container: MedusaContainer, orderId: string): Promise<OrderRow> {
  const [order] = await orders(container, { id: orderId })
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  return order
}

async function saveDelivery(container: MedusaContainer, order: OrderRow, delivered: Delivery | null) {
  await container.resolve(Modules.ORDER).updateOrders(order.id, { metadata: { ...(order.metadata ?? {}), delivered: delivered ?? '' } })
}

/** Segna consegnato: la merce esce dal magazzino, prima i pezzi pronti e poi lo sfuso. */
export async function deliverOrder(container: MedusaContainer, orderId: string, actor: string | null): Promise<Counts> {
  const order = await oneOrder(container, orderId)
  if (order.status === 'canceled') throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'L’ordine è annullato.')
  if (deliveryOf(order.metadata)) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'L’ordine risulta già consegnato.')

  const service = magazzino(container)
  const movements = deliveryMovements(await service.currentCounts(), linesOf(order))
  const counts = await service.applyMovements(movements, { kind: 'consegna', order_id: orderId, actor_name: actor })
  await saveDelivery(container, order, { at: new Date().toISOString(), by: actor, movements })
  return counts
}

/** Annulla una consegna segnata per sbaglio: la merce torna dove era e l'ordine torna aperto. */
export async function undoDelivery(container: MedusaContainer, orderId: string, actor: string | null): Promise<Counts> {
  const order = await oneOrder(container, orderId)
  const delivered = deliveryOf(order.metadata)
  if (!delivered) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'L’ordine non risulta consegnato.')
  const counts = await magazzino(container).applyMovements(
    delivered.movements.map((movement) => ({ sku: movement.sku, delta: -movement.delta })),
    { kind: 'annullo_consegna', order_id: orderId, actor_name: actor },
  )
  await saveDelivery(container, order, null)
  return counts
}
