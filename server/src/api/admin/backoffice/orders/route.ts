import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../lib/bookings/actors'
import { placeBooking } from '../../../../lib/bookings/create'
import type { BookingCreate } from '../validators'

/** Nuovo ordine dal back office ("inserito da" = l'utente), eventualmente attribuito a un agente. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof BookingCreate>>, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const { orderId } = await placeBooking(req.scope, req.validatedBody, actor)
  res.status(201).json({ order_id: orderId })
}
