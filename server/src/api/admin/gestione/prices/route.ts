import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { updateProductVariantsWorkflow } from '@medusajs/medusa/core-flows'
import type { PriceSet } from '../validators'

/** Prezzo di listino IVA inclusa di un formato (lo sfuso al litro o al chilo), uguale per sito e gestionale. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PriceSet>>, res: MedusaResponse) {
  const { sku, price } = req.validatedBody
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'product_variant', fields: ['id'], filters: { sku } })
  const variant = data[0] as { id: string } | undefined
  if (!variant) throw new MedusaError(MedusaError.Types.NOT_FOUND, `Il formato ${sku} non è nel catalogo.`)
  await updateProductVariantsWorkflow(req.scope).run({
    input: { selector: { id: variant.id }, update: { prices: [{ currency_code: 'eur', amount: price }] } },
  })
  res.json({ sku, price })
}
