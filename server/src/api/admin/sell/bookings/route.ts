import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { agentForUser } from '../../../../lib/bookings/actors'
import { placeBooking } from '../../../../lib/bookings/create'
import { periodFromQuery } from '../../../../lib/bookings/period'
import { agentOrderIds, loadBookings } from '../../../../lib/bookings/read'
import type { BookingCreate } from '../../backoffice/validators'

/** Storico delle prenotazioni dell'agente, dalla più recente. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  const bookings = await loadBookings(req.scope, await agentOrderIds(req.scope, agent.id), periodFromQuery(req.query))
  res.json({ bookings })
}

/** Nuova prenotazione, sempre attribuita all'agente che la inserisce. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof BookingCreate>>, res: MedusaResponse) {
  const { agent, actor } = await agentForUser(req.scope, req.auth_context.actor_id)
  const { orderId } = await placeBooking(req.scope, { ...req.validatedBody, agent_id: agent.id }, actor)
  const [booking] = await loadBookings(req.scope, [orderId])
  res.status(201).json({ booking })
}
