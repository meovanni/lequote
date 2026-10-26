import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { adminActor } from '../../../../../../lib/bookings/actors'
import { deliverOrder, undoDelivery } from '../../../../../../lib/magazzino'

/** Consegnato: la merce dell'ordine esce dal magazzino. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  res.json({ counts: await deliverOrder(req.scope, req.params.id, actor.name) })
}

/** Annulla una consegna segnata per sbaglio: la merce rientra. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  res.json({ counts: await undoDelivery(req.scope, req.params.id, actor.name) })
}
