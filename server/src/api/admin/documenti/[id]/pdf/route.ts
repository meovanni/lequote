import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { documentPdf, sendPdf } from '../../../../../lib/documenti'

/** Il PDF del documento; ?download=1 lo scarica invece di aprirlo. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { file, name } = await documentPdf(req.scope, req.params.id)
  sendPdf(res, file, name, req.query.download === '1')
}
