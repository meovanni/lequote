import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { DOCUMENTI_MODULE } from '../../../../../modules/documenti'
import type DocumentiModuleService from '../../../../../modules/documenti/service'

/** Annulla un DDT o una fattura: il numero resta, per gli ordini se ne può fare uno nuovo. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: DocumentiModuleService = req.scope.resolve(DOCUMENTI_MODULE)
  await service.cancelDocument(req.params.id)
  res.json({ id: req.params.id, status: 'canceled' })
}
