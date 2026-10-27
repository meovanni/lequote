import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { labelSiteUrl, lotPageUrl, storefrontUrl } from '../../../../../modules/filiera/lib/lot-qr'
import { filiera } from '../../helpers'
import type { LotUpdate } from '../../validators'

const DETAIL_RELATIONS = ['campaign', 'packaging_establishment', 'stages']

/** Pagina del lotto sul sito che risponde ora (in sviluppo quello locale); null se STOREFRONT_URL manca in produzione. */
function publicUrl(code: string): string | null {
  try {
    return lotPageUrl(storefrontUrl(), code)
  } catch {
    return null
  }
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = filiera(req)
  const lot = await service.retrieveLot(req.params.id, { relations: DETAIL_RELATIONS })
  const blockers = await service.lotPublishBlockers(req.params.id)
  // qr_url è l'indirizzo stampato nel QR: sempre il dominio vero (lot-qr.ts).
  res.json({ lot, publish_blockers: blockers, public_url: publicUrl(lot.code), qr_url: lotPageUrl(labelSiteUrl(), lot.code) })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof LotUpdate>>, res: MedusaResponse) {
  const service = filiera(req)
  await service.updateLotChecked(req.params.id, req.validatedBody)
  const lot = await service.retrieveLot(req.params.id, { relations: DETAIL_RELATIONS })
  res.json({ lot })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await filiera(req).deleteDraftLot(req.params.id)
  res.json({ id: req.params.id, object: 'filiera_lot', deleted: true })
}
