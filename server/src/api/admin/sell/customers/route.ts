import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { agentForUser } from '../../../../lib/bookings/actors'
import { knownCustomers } from '../../../../lib/bookings/customers'
import { agentOrderIds } from '../../../../lib/bookings/read'

/** I clienti delle prenotazioni dell'agente: solo i suoi, non quelli degli altri. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  res.json({ customers: await knownCustomers(req.scope, await agentOrderIds(req.scope, agent.id)) })
}
