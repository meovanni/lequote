import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../lib/bookings/actors'
import { issueInvoice } from '../../../../lib/documenti'
import type { InvoiceCreate } from '../validators'

/** Nuova fattura (copia di cortesia) per uno o più ordini dello stesso cliente. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof InvoiceCreate>>, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const { order_ids, ...input } = req.validatedBody
  const document = await issueInvoice(req.scope, order_ids, input, actor.name)
  res.status(201).json({ document: { id: document.id, number: document.number, year: document.year } })
}
