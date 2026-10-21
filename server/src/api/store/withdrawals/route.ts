import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError, Modules } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { adminOrderUrl } from '../../../lib/order-email-data'
import { RECESSO_MODULE } from '../../../modules/recesso'
import {
  createRateLimiter,
  orderDisplayId,
  renderOwnerWithdrawal,
  renderWithdrawalReceipt,
  type WithdrawalEmailData,
} from '../../../modules/recesso/lib/withdrawal'
import type RecessoModuleService from '../../../modules/recesso/service'
import type { WithdrawalCreate } from './validators'

// Cinque dichiarazioni l'ora per indirizzo IP: largamente sufficienti a un cliente, un freno a
// chi volesse usare la ricevuta per mandare email a terzi.
const allow = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

/** L'ordine a cui si riferisce il recesso, se numero ed email corrispondono. */
async function matchOrder(container: MedusaContainer, reference: string, email: string): Promise<string | null> {
  const displayId = orderDisplayId(reference)
  if (displayId === null) return null
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'order', fields: ['id', 'email'], filters: { display_id: String(displayId) } })
  const order = data[0] as { id: string; email: string | null } | undefined
  return order?.email?.toLowerCase() === email.toLowerCase() ? order.id : null
}

/** Funzione di recesso (art. 54-bis Cod. Consumo): registra la dichiarazione e invia la ricevuta. */
export async function POST(req: MedusaRequest<z.infer<typeof WithdrawalCreate>>, res: MedusaResponse) {
  const body = req.validatedBody
  const submittedAt = new Date()

  // Il programma che compila il campo trappola riceve la stessa risposta di una persona.
  if (body.website) {
    res.status(201).json({ withdrawal: { submitted_at: submittedAt } })
    return
  }
  if (!allow(req.ip ?? 'sconosciuto')) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Troppe richieste: riprova tra un’ora o scrivici a info@lequote.it.')
  }

  const orderId = await matchOrder(req.scope, body.order_reference, body.email)
  const recesso: RecessoModuleService = req.scope.resolve(RECESSO_MODULE)
  const withdrawal = await recesso.createWithdrawals({
    name: body.name,
    email: body.email,
    order_reference: body.order_reference,
    order_id: orderId,
    details: body.details ?? null,
    locale: body.locale,
    submitted_at: submittedAt,
  })

  const data: WithdrawalEmailData = {
    name: body.name,
    email: body.email,
    orderReference: body.order_reference,
    details: body.details ?? null,
    locale: body.locale,
    submittedAt,
    matchedOrderId: orderId,
  }
  await sendEmails(req.scope, data)

  res.status(201).json({ withdrawal: { id: withdrawal.id, submitted_at: submittedAt } })
}

/** La ricevuta al cliente è dovuta per legge: se non parte, l'errore resta nel log e i titolari lo vedono nel back office. */
async function sendEmails(container: MedusaContainer, data: WithdrawalEmailData) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notifications = container.resolve(Modules.NOTIFICATION)
  const alertTo = process.env.ORDER_ALERT_EMAIL
  const results = await Promise.allSettled([
    notifications.createNotifications({
      to: data.email,
      channel: 'email',
      template: 'withdrawal-receipt',
      content: renderWithdrawalReceipt(data),
      ...(alertTo && { provider_data: { replyTo: alertTo } }),
    }),
    alertTo
      ? notifications.createNotifications({
          to: alertTo,
          channel: 'email',
          template: 'withdrawal-alert',
          content: renderOwnerWithdrawal(data, data.matchedOrderId ? adminOrderUrl(data.matchedOrderId) : null),
          provider_data: { replyTo: data.email },
        })
      : Promise.resolve(),
  ])
  for (const result of results) {
    if (result.status === 'rejected') logger.error(`Email del recesso (${data.orderReference}) non inviata: ${String(result.reason)}`)
  }
}
