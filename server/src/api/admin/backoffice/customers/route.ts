import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { knownCustomers } from '../../../../lib/bookings/customers'

/** Clienti degli ordini passati, per ritrovarli nel "Nuovo ordine". */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ customers: await knownCustomers(req.scope) })
}
