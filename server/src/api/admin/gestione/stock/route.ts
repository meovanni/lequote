import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../lib/bookings/actors'
import { MAGAZZINO_MODULE } from '../../../../modules/magazzino'
import { formatOf } from '../../../../modules/magazzino/lib/formats'
import type MagazzinoModuleService from '../../../../modules/magazzino/service'
import type { StockSet } from '../validators'

/** Rettifica in riga: la quantità contata (litri o chili di sfuso, pezzi pronti di un formato). */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof StockSet>>, res: MedusaResponse) {
  const { sku, quantity } = req.validatedBody
  const format = formatOf(sku)!
  // Lo sfuso si conta in millilitri o grammi; i pezzi sono interi.
  const stored = Math.round(format.bulk ? quantity * format.size : quantity)
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const magazzino: MagazzinoModuleService = req.scope.resolve(MAGAZZINO_MODULE)
  res.json({ counts: await magazzino.setCount(sku, stored, actor.name) })
}
