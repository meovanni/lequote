import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../../../lib/bookings/actors'
import { addPayment } from '../../../../../../lib/bookings/payments'
import type { PaymentCreate } from '../../../validators'

/** Incasso registrato dal back office su qualsiasi ordine: del sito o di un agente. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PaymentCreate>>, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const payments = await addPayment(req.scope, req.params.id, req.validatedBody, actor)
  res.status(201).json({ payments })
}
