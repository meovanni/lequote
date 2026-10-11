import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera } from '../../../helpers'
import type { LotStagesReplace } from '../../../validators'

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof LotStagesReplace>>, res: MedusaResponse) {
  const inputs = req.validatedBody.stages.map((stage) => ({
    template_id: stage.template_id,
    date: stage.date ?? null,
    place: stage.place ?? null,
    values: stage.values,
  }))
  const stages = await filiera(req).replaceLotStages(req.params.id, inputs)
  res.json({ stages })
}
