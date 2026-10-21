import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { bookableVariants, deliveryOptions } from '../../../../lib/bookings/catalog'
import { VENDITE_MODULE } from '../../../../modules/vendite'
import type VenditeModuleService from '../../../../modules/vendite/service'

/** Tutto quello che serve per inserire un ordine dal back office: formati, consegne, agenti. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const [variants, delivery, agents] = await Promise.all([
    bookableVariants(req.scope),
    deliveryOptions(req.scope),
    vendite.listSalesAgents({ active: true }, { order: { name: 'ASC' } }),
  ])
  res.json({ variants, delivery_options: delivery, agents: agents.map(({ id, name }) => ({ id, name })) })
}
