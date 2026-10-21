import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { periodFromQuery } from '../../../../lib/bookings/period'
import { salesByAgent } from '../../../../lib/bookings/read'

/** Riepilogo delle vendite di ogni agente e classifica; ?from=AAAA-MM-GG&to=AAAA-MM-GG. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { rows, ranking } = await salesByAgent(req.scope, periodFromQuery(req.query))
  res.json({
    agents: rows.map(({ agent, summary }) => ({ agent: { id: agent.id, name: agent.name, active: agent.active }, summary })),
    ranking,
  })
}
