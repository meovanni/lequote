import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { periodFromQuery } from '../../../../lib/bookings/period'
import { agentOrderIds, loadBookings } from '../../../../lib/bookings/read'
import { VENDITE_MODULE } from '../../../../modules/vendite'
import { summarizeSales } from '../../../../modules/vendite/lib/sales'
import type VenditeModuleService from '../../../../modules/vendite/service'
import type { AgentUpdate } from '../../backoffice/validators'

/** Scheda di un agente: prenotazioni e riepilogo per prodotto e per cliente nel periodo. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const agent = await vendite.retrieveSalesAgent(req.params.id)
  const bookings = await loadBookings(req.scope, await agentOrderIds(req.scope, agent.id), periodFromQuery(req.query))
  res.json({ agent, bookings, summary: summarizeSales(bookings) })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AgentUpdate>>, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const agent = await vendite.updateSalesAgents({ id: req.params.id, ...req.validatedBody })
  res.json({ agent })
}
