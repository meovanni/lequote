import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { agentForUser } from '../../../../lib/bookings/actors'
import { periodFromQuery } from '../../../../lib/bookings/period'
import { agentOrderIds, loadBookings, salesByAgent } from '../../../../lib/bookings/read'
import { summarizeSales } from '../../../../modules/vendite/lib/sales'

/**
 * Area vendita: l'agente collegato all'account, il suo riepilogo e la classifica nel periodo.
 * Degli altri agenti si vedono solo posizione, nome e pezzi: non fatturato, clienti né ordini.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  const period = periodFromQuery(req.query)
  const bookings = await loadBookings(req.scope, await agentOrderIds(req.scope, agent.id), period)
  const { ranking } = await salesByAgent(req.scope, period)
  res.json({
    agent: { id: agent.id, name: agent.name },
    summary: summarizeSales(bookings),
    // Degli altri agenti niente fatturato: solo posizione, nome e pezzi (scelta dei titolari).
    ranking: ranking.map(({ position, agentId, name, quantity }) => ({ position, name, quantity, me: agentId === agent.id })),
  })
}
