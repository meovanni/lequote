import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../../lib/bookings/actors'
import { editBooking } from '../../../../../lib/bookings/edit'
import { paymentState } from '../../../../../lib/bookings/payments'
import { loadBookings } from '../../../../../lib/bookings/read'
import type { BookingUpdate } from '../../validators'

/** Scheda gestionale di un ordine: chi l'ha inserito, agente, incassi e residuo. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const [booking] = await loadBookings(req.scope, [req.params.id])
  if (!booking) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Ordine non trovato.')
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'order', fields: ['sales_agent.id', 'sales_agent.name'], filters: { id: req.params.id } })
  const agent = (data[0] as unknown as { sales_agent?: { id: string; name: string } | null } | undefined)?.sales_agent ?? null
  res.json({ booking, agent, payments: await paymentState(req.scope, req.params.id) })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof BookingUpdate>>, res: MedusaResponse) {
  await editBooking(req.scope, req.params.id, req.validatedBody, await adminActor(req.scope, req.auth_context.actor_id))
  const [booking] = await loadBookings(req.scope, [req.params.id])
  res.json({ booking })
}
