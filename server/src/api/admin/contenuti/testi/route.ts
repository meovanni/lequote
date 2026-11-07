import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { CONTENUTI_MODULE } from '../../../../modules/contenuti'
import type ContenutiModuleService from '../../../../modules/contenuti/service'
import type { ContentDraft } from '../validators'

/** Salva in bozza un testo o una foto; un valore vuoto torna al testo di partenza. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof ContentDraft>>, res: MedusaResponse) {
  const contenuti: ContenutiModuleService = req.scope.resolve(CONTENUTI_MODULE)
  const { key, scope, value } = req.validatedBody
  const entry = await contenuti.saveDraft(key, scope, value)
  res.json({ entry })
}
