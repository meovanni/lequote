import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera, paging, productLineFilter } from '../helpers'
import type { CampaignCreate } from '../validators'

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { take, skip } = paging(req)
  const [campaigns, count] = await filiera(req).listAndCountCampaigns(productLineFilter(req), {
    relations: ['mill', 'groves', 'apiaries'],
    order: { created_at: 'DESC' },
    take,
    skip,
  })
  res.json({ campaigns, count, limit: take, offset: skip })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof CampaignCreate>>, res: MedusaResponse) {
  const { grove_ids, apiary_ids, ...data } = req.validatedBody
  const campaign = await filiera(req).createCampaigns({ ...data, groves: grove_ids, apiaries: apiary_ids })
  res.status(201).json({ campaign })
}
