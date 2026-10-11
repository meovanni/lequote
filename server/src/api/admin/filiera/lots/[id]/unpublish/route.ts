import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { filiera } from '../../../helpers'

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const lot = await filiera(req).unpublishLot(req.params.id)
  res.json({ lot })
}
