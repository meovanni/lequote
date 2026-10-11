import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera } from '../../helpers'
import type { StageTemplateUpdate } from '../../validators'

// Cambiare un modello non tocca i lotti già compilati: le loro fasi ne hanno una copia.
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof StageTemplateUpdate>>, res: MedusaResponse) {
  const template = await filiera(req).updateStageTemplates({ id: req.params.id, ...req.validatedBody })
  res.json({ template })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await filiera(req).deleteStageTemplates(req.params.id)
  res.json({ id: req.params.id, object: 'filiera_stage_template', deleted: true })
}
