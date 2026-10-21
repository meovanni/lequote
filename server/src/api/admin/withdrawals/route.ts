import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { RECESSO_MODULE } from '../../../modules/recesso'
import type RecessoModuleService from '../../../modules/recesso/service'
import { paging } from '../filiera/helpers'

/** Recessi ricevuti dal sito, dal più recente; ?open=1 solo quelli ancora da gestire. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const recesso: RecessoModuleService = req.scope.resolve(RECESSO_MODULE)
  const filters = req.query.open === '1' ? { handled_at: null } : {}
  const [withdrawals, count] = await recesso.listAndCountWithdrawals(filters, {
    ...paging(req),
    order: { submitted_at: 'DESC' },
  })
  res.json({ withdrawals, count })
}
