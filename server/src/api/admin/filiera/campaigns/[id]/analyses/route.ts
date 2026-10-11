import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { filieraFileStore } from '../../../../../../modules/filiera/lib/private-files'
import { filiera } from '../../../helpers'
import type { AnalysisCreate } from '../../../validators'

// Analisi annuale della campagna: vale per tutti i suoi lotti. Il referto va nell'archivio
// privato; se il salvataggio nel database fallisce, il file appena scritto si rimuove.
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AnalysisCreate>>, res: MedusaResponse) {
  const service = filiera(req)
  await service.retrieveCampaign(req.params.id)

  const { file_base64, ...data } = req.validatedBody
  const store = filieraFileStore()
  const saved = await store.save(Buffer.from(file_base64, 'base64'))
  if (!saved.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, saved.error)

  try {
    const analysis = await service.createAnalyses({
      ...data,
      file_key: saved.key,
      content_type: saved.contentType,
      campaign_id: req.params.id,
    })
    res.status(201).json({ analysis })
  } catch (error) {
    await store.remove(saved.key)
    throw error
  }
}
