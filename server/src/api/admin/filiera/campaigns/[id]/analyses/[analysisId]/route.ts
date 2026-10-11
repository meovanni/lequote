import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { filieraFileStore } from '../../../../../../../modules/filiera/lib/private-files'
import { filiera } from '../../../../helpers'

async function analysisInCampaign(req: AuthenticatedMedusaRequest) {
  const analysis = await filiera(req).retrieveAnalysis(req.params.analysisId)
  if (analysis.campaign_id !== req.params.id) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Analisi non trovata in questa campagna.')
  }
  return analysis
}

/** Il referto, anche se interno: questa rotta è solo per chi è entrato nel back office. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const analysis = await analysisInCampaign(req)
  const data = await filieraFileStore().read(analysis.file_key)
  res.setHeader('Content-Type', analysis.content_type)
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'private, no-store')
  res.send(data)
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const analysis = await analysisInCampaign(req)
  await filiera(req).deleteAnalyses(analysis.id)
  await filieraFileStore().remove(analysis.file_key)
  res.json({ id: analysis.id, object: 'filiera_analysis', deleted: true })
}
