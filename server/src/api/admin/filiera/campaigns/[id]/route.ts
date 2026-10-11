import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filieraFileStore } from '../../../../../modules/filiera/lib/private-files'
import { filiera } from '../../helpers'
import type { CampaignUpdate } from '../../validators'

const DETAIL_RELATIONS = ['mill', 'groves', 'apiaries', 'analyses', 'lots']

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const campaign = await filiera(req).retrieveCampaign(req.params.id, { relations: DETAIL_RELATIONS })
  res.json({ campaign })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof CampaignUpdate>>, res: MedusaResponse) {
  const { grove_ids, apiary_ids, ...data } = req.validatedBody
  const service = filiera(req)
  await service.updateCampaigns({
    id: req.params.id,
    ...data,
    ...(grove_ids ? { groves: grove_ids } : {}),
    ...(apiary_ids ? { apiaries: apiary_ids } : {}),
  })
  const campaign = await service.retrieveCampaign(req.params.id, { relations: DETAIL_RELATIONS })
  res.json({ campaign })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const fileKeys = await filiera(req).deleteEmptyCampaign(req.params.id)
  const store = filieraFileStore()
  await Promise.all(fileKeys.map((key) => store.remove(key)))
  res.json({ id: req.params.id, object: 'filiera_campaign', deleted: true })
}
