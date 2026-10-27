import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { updatePricing } from '../../../../lib/pricing'
import type { PriceSet } from '../validators'

/**
 * Listino di una linea: il prezzo al litro (o al chilo) IVA inclusa e il supplemento confezione di
 * un formato. I prezzi di tutti i formati si ricalcolano da lì (lib/pricing.ts).
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PriceSet>>, res: MedusaResponse) {
  const { line, unit_price, surcharge } = req.validatedBody
  const pricing = await updatePricing(req.scope, line, {
    ...(unit_price !== undefined ? { unitPrice: unit_price } : {}),
    ...(surcharge ? { surcharges: { [surcharge.sku]: surcharge.amount } } : {}),
  })
  res.json({ line, pricing })
}
