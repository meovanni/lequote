import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { RECESSO_MODULE } from '../../../../modules/recesso'
import type RecessoModuleService from '../../../../modules/recesso/service'
import type { WithdrawalUpdate } from '../validators'

/** Segna un recesso come gestito (o di nuovo aperto) e ne aggiorna le note interne. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof WithdrawalUpdate>>, res: MedusaResponse) {
  const recesso: RecessoModuleService = req.scope.resolve(RECESSO_MODULE)
  const { handled, notes } = req.validatedBody
  const withdrawal = await recesso.updateWithdrawals({
    id: req.params.id,
    ...(handled !== undefined && { handled_at: handled ? new Date() : null }),
    ...(notes !== undefined && { notes }),
  })
  res.json({ withdrawal })
}
