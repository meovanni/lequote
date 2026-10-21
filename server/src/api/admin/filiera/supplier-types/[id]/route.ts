import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { filiera } from '../../helpers'

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await filiera(req).deleteSupplierTypeChecked(req.params.id)
  res.json({ id: req.params.id, object: 'filiera_supplier_type', deleted: true })
}
