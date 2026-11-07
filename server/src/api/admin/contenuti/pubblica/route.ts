import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { CONTENUTI_MODULE } from '../../../../modules/contenuti'
import { startPublication } from '../../../../modules/contenuti/lib/run-publication'
import type ContenutiModuleService from '../../../../modules/contenuti/service'

/** Mette online le modifiche in bozza; la generazione del sito continua dopo la risposta. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const contenuti: ContenutiModuleService = req.scope.resolve(CONTENUTI_MODULE)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { publication } = await startPublication(contenuti, logger)
  res.status(202).json({ publication })
}
