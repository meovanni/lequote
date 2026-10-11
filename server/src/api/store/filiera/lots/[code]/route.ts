import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { FILIERA_MODULE } from '../../../../../modules/filiera'
import { parseLotCode } from '../../../../../modules/filiera/lib/lot-code'
import type FilieraModuleService from '../../../../../modules/filiera/service'

// Pagina di lotto raggiunta dal campo di ricerca o dal QR in etichetta. Risponde solo con la
// proiezione pubblica (lib/public-lot.ts); un lotto in bozza è indistinguibile da uno inesistente.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = parseLotCode(String(req.params.code ?? ''))
  if (!parsed.ok) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Codice lotto non valido.')
  }

  const filiera: FilieraModuleService = req.scope.resolve(FILIERA_MODULE)
  const lot = await filiera.retrievePublicLot(parsed.code)
  if (!lot) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Nessun lotto pubblicato con codice ${parsed.code}.`)
  }

  res.json({ lot })
}
