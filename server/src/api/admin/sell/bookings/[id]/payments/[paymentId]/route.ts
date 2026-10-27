import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { agentForUser, assertAgentOwnsOrder } from '../../../../../../../lib/bookings/actors'
import { deletePayment, updatePayment } from '../../../../../../../lib/bookings/payments'
import type { PaymentUpdate } from '../../../../../backoffice/validators'

/** L'agente corregge un incasso di una sua prenotazione. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PaymentUpdate>>, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  res.json({ payments: await updatePayment(req.scope, req.params.id, req.params.paymentId, req.validatedBody) })
}

/** L'agente elimina un incasso registrato per sbaglio su una sua prenotazione. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  res.json({ payments: await deletePayment(req.scope, req.params.id, req.params.paymentId) })
}
