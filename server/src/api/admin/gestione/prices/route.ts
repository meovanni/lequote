import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { updatePricing } from '../../../../lib/pricing'
import type { PriceSet } from '../validators'

/**
 * Listino di una linea: prezzo al litro (o al chilo) IVA inclusa, costo di confezione di un formato o
 * prezzo scelto a mano (null lo riallinea allo standard). I prezzi dei formati si ricalcolano (lib/pricing.ts).
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PriceSet>>, res: MedusaResponse) {
  const { line, unit_price, surcharge, custom } = req.validatedBody
  const pricing = await updatePricing(req.scope, line, {
    ...(unit_price !== undefined ? { unitPrice: unit_price } : {}),
    ...(surcharge ? { surcharges: { [surcharge.sku]: surcharge.amount } } : {}),
    ...(custom ? { overrides: { [custom.sku]: custom.price } } : {}),
  })
  res.json({ line, pricing })
}
