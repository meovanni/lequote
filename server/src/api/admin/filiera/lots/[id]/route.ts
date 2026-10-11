import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera } from '../../helpers'
import type { LotUpdate } from '../../validators'

const DETAIL_RELATIONS = ['campaign', 'packaging_establishment', 'stages']

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = filiera(req)
  const lot = await service.retrieveLot(req.params.id, { relations: DETAIL_RELATIONS })
  const blockers = await service.lotPublishBlockers(req.params.id)
  res.json({ lot, publish_blockers: blockers })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof LotUpdate>>, res: MedusaResponse) {
  const service = filiera(req)
  await service.updateLotChecked(req.params.id, req.validatedBody)
  const lot = await service.retrieveLot(req.params.id, { relations: DETAIL_RELATIONS })
  res.json({ lot })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await filiera(req).deleteDraftLot(req.params.id)
  res.json({ id: req.params.id, object: 'filiera_lot', deleted: true })
}
