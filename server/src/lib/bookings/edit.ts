import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MathBN, MedusaError } from '@medusajs/framework/utils'
import {
  beginOrderEditOrderWorkflow,
  cancelBeginOrderEditWorkflow,
  confirmOrderEditRequestWorkflow,
  orderEditAddNewItemWorkflow,
  orderEditUpdateItemQuantityWorkflow,
  requestOrderEditRequestWorkflow,
  updateOrderWorkflow,
} from '@medusajs/medusa/core-flows'
import { planBookingEdit, type BookingLine } from '../../modules/vendite/lib/sales'
import { assertAvailable, deliveryOf } from '../magazzino'
import { explainInventoryError } from './stock'
import type { Actor } from './types'

export type BookingChanges = {
  items?: BookingLine[]
  notes?: string | null
  email?: string | null
}

type OrderForEdit = {
  id: string
  status: string
  metadata: Record<string, unknown> | null
  items: { id: string; variant_id: string | null; quantity: number }[]
}

/**
 * Modifica una prenotazione: le righe con una modifica d'ordine di Medusa (giacenze e totali
 * ricalcolati), email e note sull'ordine. Una modifica rimasta a metà si annulla.
 */
export async function editBooking(container: MedusaContainer, orderId: string, changes: BookingChanges, actor: Actor) {
  const order = await loadOrder(container, orderId)
  if (order.status === 'canceled' || order.status === 'completed' || deliveryOf(order.metadata)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'L’ordine è consegnato o annullato: non si modifica.')
  }

  if (changes.items) {
    if (!changes.items.some((line) => line.quantity > 0)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'La prenotazione deve avere almeno un prodotto.')
    }
    const plan = planBookingEdit(order.items, changes.items)
    if (plan.update.length > 0 || plan.add.length > 0) {
      // L'ordine si confronta con il magazzino senza le sue righe attuali: conta come è dopo la modifica.
      await assertAvailable(container, changes.items, orderId)
      await beginOrderEditOrderWorkflow(container).run({ input: { order_id: orderId, created_by: actor.id } })
      try {
        if (plan.update.length > 0) {
          await orderEditUpdateItemQuantityWorkflow(container).run({ input: { order_id: orderId, items: plan.update } })
        }
        if (plan.add.length > 0) {
          await orderEditAddNewItemWorkflow(container).run({ input: { order_id: orderId, items: plan.add } })
        }
        await requestOrderEditRequestWorkflow(container).run({ input: { order_id: orderId, requested_by: actor.id, no_notification: true } })
        await confirmOrderEditRequestWorkflow(container).run({ input: { order_id: orderId, confirmed_by: actor.id } })
      } catch (error) {
        await cancelBeginOrderEditWorkflow(container)
          .run({ input: { order_id: orderId } })
          .catch(() => undefined)
        throw explainInventoryError(error)
      }
    }
  }

  if (changes.email !== undefined || changes.notes !== undefined) {
    await updateOrderWorkflow(container).run({
      input: {
        id: orderId,
        user_id: actor.id,
        ...(changes.email ? { email: changes.email } : {}),
        ...(changes.notes !== undefined ? { metadata: { ...(order.metadata ?? {}), notes: changes.notes ?? '' } } : {}),
      },
    })
  }
}

async function loadOrder(container: MedusaContainer, orderId: string): Promise<OrderForEdit> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: 'order',
    // 'items.quantity' da solo torna vuoto: la quantità della riga arriva con 'items.*'.
    fields: ['id', 'status', 'metadata', 'items.*'],
    filters: { id: orderId },
  })
  const order = data[0] as unknown as OrderForEdit | undefined
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  // La quantità può arrivare come BigNumber di Medusa: confronti e somme vogliono un numero.
  return { ...order, items: order.items.map((item) => ({ ...item, quantity: MathBN.convert(item.quantity).toNumber() })) }
}
