import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { agentForUser } from '../../../../lib/bookings/actors'
import { bookableVariants, deliveryOptions } from '../../../../lib/bookings/catalog'

/** Formati con prezzo e disponibilità e consegne possibili, per una nuova prenotazione. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await agentForUser(req.scope, req.auth_context.actor_id)
  const [variants, delivery] = await Promise.all([bookableVariants(req.scope), deliveryOptions(req.scope)])
  res.json({ variants, delivery_options: delivery })
}
