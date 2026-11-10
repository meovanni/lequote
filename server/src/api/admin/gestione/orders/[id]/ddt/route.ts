import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../../../lib/bookings/actors'
import { ddtDraft, issueDdt } from '../../../../../../lib/documenti'
import type { DdtCreate } from '../../../../documenti/validators'

/** I dati di partenza del DDT di un ordine: destinatario, righe, colli. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ draft: await ddtDraft(req.scope, req.params.id) })
}

/** Emette il DDT dell'ordine. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof DdtCreate>>, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const document = await issueDdt(req.scope, req.params.id, req.validatedBody, actor.name)
  res.status(201).json({ document: { id: document.id, number: document.number, year: document.year } })
}
