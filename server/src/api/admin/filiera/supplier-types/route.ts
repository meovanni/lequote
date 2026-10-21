import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera } from '../helpers'
import type { SupplierTypeCreate } from '../validators'

/** Tipologie di fornitore, in ordine alfabetico. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const types = await filiera(req).listSupplierTypes({}, { order: { name: 'ASC' } })
  res.json({ types })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof SupplierTypeCreate>>, res: MedusaResponse) {
  const type = await filiera(req).createSupplierTypes({ name: req.validatedBody.name, code: null })
  res.status(201).json({ type })
}
