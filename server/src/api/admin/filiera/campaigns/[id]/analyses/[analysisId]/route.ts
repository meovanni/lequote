import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { analysisResultsFrom, type AnalysisResults } from '../../../../../../../modules/filiera/lib/analysis-values'
import { filieraFileStore } from '../../../../../../../modules/filiera/lib/private-files'
import { filiera } from '../../../../helpers'
import type { AnalysisUpdate } from '../../../../validators'

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

/** Correzioni di dati, testo e valori letti dal referto. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AnalysisUpdate>>, res: MedusaResponse) {
  const analysis = await analysisInCampaign(req)
  const { markdown, values, nutrition_basis, ...data } = req.validatedBody
  const current = (analysis.results as AnalysisResults | null) ?? analysisResultsFrom('')
  const results: AnalysisResults = {
    markdown: markdown ?? current.markdown,
    values: values ?? current.values,
    nutrition_basis: nutrition_basis ?? current.nutrition_basis,
  }
  const updated = await filiera(req).updateAnalyses({ id: analysis.id, ...data, results })
  res.json({ analysis: updated })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const analysis = await analysisInCampaign(req)
  await filiera(req).deleteAnalyses(analysis.id)
  await filieraFileStore().remove(analysis.file_key)
  res.json({ id: analysis.id, object: 'filiera_analysis', deleted: true })
}
