import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera, productLineFilter } from '../helpers'
import type { StageTemplateCreate } from '../validators'

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const templates = await filiera(req).listStageTemplates(productLineFilter(req), {
    order: { product_line: 'ASC', position: 'ASC' },
  })
  res.json({ templates })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof StageTemplateCreate>>, res: MedusaResponse) {
  const template = await filiera(req).createStageTemplates(req.validatedBody)
  res.status(201).json({ template })
}
