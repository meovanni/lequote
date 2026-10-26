import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { pdfToMarkdown } from '../../../../../../modules/filiera/lib/analysis-markdown'
import { analysisResultsFrom } from '../../../../../../modules/filiera/lib/analysis-values'
import { filieraFileStore } from '../../../../../../modules/filiera/lib/private-files'
import { filiera } from '../../../helpers'
import type { AnalysisCreate } from '../../../validators'

// Analisi annuale della campagna: vale per tutti i suoi lotti. Il referto va nell'archivio
// privato; se il salvataggio nel database fallisce, il file appena scritto si rimuove. Dal PDF si
// estrae il testo in markdown e se ne leggono i valori, da controllare poi nel back office.
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AnalysisCreate>>, res: MedusaResponse) {
  const service = filiera(req)
  await service.retrieveCampaign(req.params.id)

  const { file_base64, ...data } = req.validatedBody
  const file = Buffer.from(file_base64, 'base64')
  const store = filieraFileStore()
  const saved = await store.save(file)
  if (!saved.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, saved.error)
  const markdown = saved.contentType === 'application/pdf' ? await pdfToMarkdown(file) : ''

  try {
    const analysis = await service.createAnalyses({
      ...data,
      file_key: saved.key,
      content_type: saved.contentType,
      results: analysisResultsFrom(markdown),
      campaign_id: req.params.id,
    })
    res.status(201).json({ analysis })
  } catch (error) {
    await store.remove(saved.key)
    throw error
  }
}
