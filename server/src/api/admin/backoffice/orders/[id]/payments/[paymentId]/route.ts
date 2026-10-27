import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { deletePayment, updatePayment } from '../../../../../../../lib/bookings/payments'
import type { PaymentUpdate } from '../../../../validators'

/** Corregge un incasso registrato: mezzo di pagamento, importo, data o note. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PaymentUpdate>>, res: MedusaResponse) {
  res.json({ payments: await updatePayment(req.scope, req.params.id, req.params.paymentId, req.validatedBody) })
}

/** Elimina un incasso registrato per sbaglio. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ payments: await deletePayment(req.scope, req.params.id, req.params.paymentId) })
}
