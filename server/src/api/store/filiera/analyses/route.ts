import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { FILIERA_MODULE } from '../../../../modules/filiera'
import type FilieraModuleService from '../../../../modules/filiera/service'

// Analisi pubbliche per la pagina Analisi e per le schede prodotto (acidità, valori nutrizionali,
// profilo organolettico). ?line=olio|miele restringe a una linea; altri valori si ignorano.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const line = req.query.line === 'olio' || req.query.line === 'miele' ? req.query.line : undefined
  const filiera: FilieraModuleService = req.scope.resolve(FILIERA_MODULE)
  const campaigns = await filiera.listPublicAnalyses(line)
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.json({ campaigns })
}
