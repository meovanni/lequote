import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { capturePaymentWorkflow } from '@medusajs/medusa/core-flows'
import { VENDITE_MODULE } from '../../modules/vendite'
import { balanceDue, paymentViolation } from '../../modules/vendite/lib/sales'
import type VenditeModuleService from '../../modules/vendite/service'
import type { Actor, PaymentInput } from './types'

type OrderForPayment = {
  id: string
  status: string
  total: number
  payment_collections?: { payments?: { id: string; captured_at: string | null }[] | null }[] | null
}

export type PaymentState = {
  total: number
  paid: number
  due: number
  payments: Awaited<ReturnType<VenditeModuleService['listSalePayments']>>
}

/** Totale, incassato e residuo di un ordine, con gli incassi registrati dal più recente. */
export async function paymentState(container: MedusaContainer, orderId: string): Promise<PaymentState> {
  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  const order = await loadOrder(container, orderId)
  const payments = await vendite.listSalePayments({ order_id: orderId }, { order: { paid_at: 'DESC' } })
  const total = Number(order.total)
  const due = balanceDue(
    total,
    payments.map((payment) => Number(payment.amount)),
  )
  return { total, paid: Math.round((total - due) * 100) / 100, due, payments }
}

/**
 * Registra un incasso (acconto o saldo). Quando l'ordine è saldato, il pagamento di Medusa risulta
 * incassato: l'ordine compare come pagato anche nell'elenco Ordini.
 */
export async function addPayment(container: MedusaContainer, orderId: string, input: PaymentInput, actor: Actor): Promise<PaymentState> {
  const order = await loadOrder(container, orderId)
  if (order.status === 'canceled') {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'L’ordine è annullato: non si registrano incassi.')
  }

  const before = await paymentState(container, orderId)
  const violation = paymentViolation(before.due, input.amount)
  if (violation) throw new MedusaError(MedusaError.Types.INVALID_DATA, violation)

  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  await vendite.createSalePayments({
    order_id: orderId,
    amount: input.amount,
    method: input.method,
    paid_at: input.paid_at ?? new Date(),
    recorded_by_type: actor.type,
    recorded_by_id: actor.id,
    recorded_by_name: actor.name,
    notes: input.notes ?? null,
  })

  const after = await paymentState(container, orderId)
  if (after.due === 0) {
    const pending = (order.payment_collections ?? [])
      .flatMap((collection) => collection.payments ?? [])
      .filter((payment) => !payment.captured_at)
    for (const payment of pending) {
      await capturePaymentWorkflow(container).run({ input: { payment_id: payment.id, captured_by: actor.id } })
    }
  }
  return after
}

async function loadOrder(container: MedusaContainer, orderId: string): Promise<OrderForPayment> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: 'order',
    fields: ['id', 'status', 'total', 'payment_collections.payments.id', 'payment_collections.payments.captured_at'],
    filters: { id: orderId },
  })
  const order = data[0] as unknown as OrderForPayment | undefined
  if (!order) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  return order
}
