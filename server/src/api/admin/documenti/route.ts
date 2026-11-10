import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { listDocuments } from '../../../lib/documenti'
import { DOCUMENTI_MODULE } from '../../../modules/documenti'
import { documentYear } from '../../../modules/documenti/lib/build'
import type DocumentiModuleService from '../../../modules/documenti/service'

/** DDT e fatture emessi, dal più recente, con i prossimi numeri liberi dell'anno. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const year = Number(req.query.year) || undefined
  const service: DocumentiModuleService = req.scope.resolve(DOCUMENTI_MODULE)
  const current = documentYear(new Date())
  const [documents, ddt, fattura] = await Promise.all([
    listDocuments(req.scope, { year }),
    service.nextNumber('ddt', current),
    service.nextNumber('fattura', current),
  ])
  res.json({ documents, year: current, next: { ddt, fattura } })
}
