import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { invoiceSummaryCsv } from '../../../../lib/documenti'
import { documentYear } from '../../../../modules/documenti/lib/build'

/** Riepilogo CSV delle fatture dell'anno (?year=2026), da passare al commercialista. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const year = Number(req.query.year) || documentYear(new Date())
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="fatture-${year}.csv"`)
  res.setHeader('Cache-Control', 'private, no-store')
  res.send(await invoiceSummaryCsv(req.scope, year))
}
