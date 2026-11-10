import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { invoiceCandidates } from '../../../../lib/documenti'

/** Ordini recenti ancora da fatturare, raggruppati per cliente. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: 'order',
    fields: ['id'],
    filters: { status: { $nin: ['draft', 'canceled'] } },
    pagination: { take: 500, order: { created_at: 'DESC' } },
  })
  res.json({ customers: await invoiceCandidates(req.scope, (data as { id: string }[]).map((order) => order.id)) })
}
