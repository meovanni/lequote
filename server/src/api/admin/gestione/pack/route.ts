import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../lib/bookings/actors'
import { MAGAZZINO_MODULE } from '../../../../modules/magazzino'
import { packMovements } from '../../../../modules/magazzino/lib/stock'
import type MagazzinoModuleService from '../../../../modules/magazzino/service'
import type { PackCreate } from '../validators'

/** Confeziona dallo sfuso: 10 latte da 5 L tolgono 50 L di sfuso e diventano 10 latte pronte. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PackCreate>>, res: MedusaResponse) {
  const { sku, pieces } = req.validatedBody
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const magazzino: MagazzinoModuleService = req.scope.resolve(MAGAZZINO_MODULE)
  res.json({ counts: await magazzino.applyMovements(packMovements(sku, pieces), { kind: 'confezionamento', actor_name: actor.name }) })
}
