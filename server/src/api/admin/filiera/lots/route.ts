import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { filiera, paging, productLineFilter } from '../helpers'
import type { LotCreate } from '../validators'

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { take, skip } = paging(req)
  const status = req.query.status === 'draft' || req.query.status === 'published' ? { status: req.query.status } : {}
  const search = typeof req.query.q === 'string' && req.query.q.trim() ? { q: req.query.q.trim() } : {}

  const [lots, count] = await filiera(req).listAndCountLots(
    { ...productLineFilter(req), ...status, ...search },
    { relations: ['campaign'], order: { created_at: 'DESC' }, take, skip },
  )
  res.json({ lots, count, limit: take, offset: skip })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof LotCreate>>, res: MedusaResponse) {
  // Nasce sempre in bozza: la pubblicazione passa da /publish, che controlla i dati obbligatori.
  const lot = await filiera(req).createLotChecked(req.validatedBody)
  res.status(201).json({ lot })
}
