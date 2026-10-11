import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { FILIERA_MODULE } from '../../../../modules/filiera'
import { filieraFileStore } from '../../../../modules/filiera/lib/private-files'
import type FilieraModuleService from '../../../../modules/filiera/service'

// Link di download delle analisi pubbliche dalla pagina del lotto (lib/public-lot.ts). Fuori da
// /store perché un link nel browser non può inviare la chiave pubblica. La visibilità si
// ricontrolla a ogni richiesta: un referto interno, o di una campagna senza lotti pubblicati,
// risponde come inesistente.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = String(req.params.id ?? '')
  const notFound = new MedusaError(MedusaError.Types.NOT_FOUND, 'Analisi non trovata.')
  if (!/^anl_[A-Za-z0-9]{10,40}$/.test(id)) throw notFound

  const filiera: FilieraModuleService = req.scope.resolve(FILIERA_MODULE)
  const [analysis] = await filiera.listAnalyses({ id, visibility: 'public' }, { take: 1 })
  if (!analysis) throw notFound

  const published = await filiera.listLots({ campaign_id: analysis.campaign_id, status: 'published' }, { take: 1 })
  if (published.length === 0) throw notFound

  const data = await filieraFileStore().read(analysis.file_key)
  res.setHeader('Content-Type', analysis.content_type)
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.send(data)
}
