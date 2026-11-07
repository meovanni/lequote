import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { CONTENUTI_MODULE } from '../../../../modules/contenuti'
import type ContenutiModuleService from '../../../../modules/contenuti/service'

/** Scarta le modifiche non ancora pubblicate: la bozza torna uguale al sito online. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const contenuti: ContenutiModuleService = req.scope.resolve(CONTENUTI_MODULE)
  const discarded = await contenuti.discardDrafts()
  res.json({ discarded })
}
