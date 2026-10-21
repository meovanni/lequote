import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { agentForUser, assertAgentOwnsOrder } from '../../../../../lib/bookings/actors'
import { editBooking } from '../../../../../lib/bookings/edit'
import { paymentState } from '../../../../../lib/bookings/payments'
import { loadBookings } from '../../../../../lib/bookings/read'
import type { BookingUpdate } from '../../../backoffice/validators'

/** Una prenotazione dell'agente, con gli incassi registrati. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  const [booking] = await loadBookings(req.scope, [req.params.id])
  res.json({ booking, payments: await paymentState(req.scope, req.params.id) })
}

/** Modifica di righe, email o note di una prenotazione dell'agente. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof BookingUpdate>>, res: MedusaResponse) {
  const { agent, actor } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  await editBooking(req.scope, req.params.id, req.validatedBody, actor)
  const [booking] = await loadBookings(req.scope, [req.params.id])
  res.json({ booking })
}
