import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { agentForUser, assertAgentOwnsOrder } from '../../../../../../../lib/bookings/actors'
import { documentPdf, sendPdf } from '../../../../../../../lib/documenti'
import { DOCUMENTI_MODULE } from '../../../../../../../modules/documenti'
import type DocumentiModuleService from '../../../../../../../modules/documenti/service'

/** Il PDF del DDT di un ordine dell'agente. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  const service: DocumentiModuleService = req.scope.resolve(DOCUMENTI_MODULE)
  const ddt = (await service.documentsForOrders([req.params.id]))[req.params.id]?.ddt
  if (!ddt) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Questo ordine non ha ancora un DDT.')
  const { file, name } = await documentPdf(req.scope, ddt.id)
  sendPdf(res, file, name, req.query.download === '1')
}
