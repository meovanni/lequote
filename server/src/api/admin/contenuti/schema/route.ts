import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { CONTENT_SCHEMA } from '../../../../modules/contenuti/lib/schema'

/** Sezioni e campi modificabili, con i testi di partenza: cambiano solo con una nuova versione del sito. */
export async function GET(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json(CONTENT_SCHEMA)
}
