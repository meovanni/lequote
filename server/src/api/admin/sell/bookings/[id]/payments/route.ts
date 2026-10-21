import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { agentForUser, assertAgentOwnsOrder } from '../../../../../../lib/bookings/actors'
import { addPayment } from '../../../../../../lib/bookings/payments'
import type { PaymentCreate } from '../../../../backoffice/validators'

/** Incasso registrato dall'agente su una sua prenotazione (acconto o saldo). */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PaymentCreate>>, res: MedusaResponse) {
  const { agent, actor } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  const payments = await addPayment(req.scope, req.params.id, req.validatedBody, actor)
  res.status(201).json({ payments })
}
