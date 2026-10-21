import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
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
  if (order.status === 'canceled' || order.status === 'completed') {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'La prenotazione è chiusa o annullata: non si modifica.')
  }

  if (changes.items) {
    if (!changes.items.some((line) => line.quantity > 0)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'La prenotazione deve avere almeno un prodotto.')
    }
    const plan = planBookingEdit(order.items, changes.items)
    if (plan.update.length > 0 || plan.add.length > 0) {
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
        throw error
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
    fields: ['id', 'status', 'metadata', 'items.id', 'items.variant_id', 'items.quantity'],
    filters: { id: orderId },
  })
  const order = data[0] as unknown as OrderForEdit | undefined
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  return order
}
