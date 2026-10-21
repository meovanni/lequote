import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { filiera, paging, parseRegistry, registryKind } from '../../helpers'
import { registryRepository } from '../repository'

// Anagrafiche: oliveti (groves), apiari (apiaries), fornitori (suppliers, con le loro tipologie).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const kind = registryKind(req.params.kind)
  const { take, skip } = paging(req)
  const [items, count] = await registryRepository(filiera(req), kind).list({ take, skip })
  res.json({ items, count, limit: take, offset: skip })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const kind = registryKind(req.params.kind)
  const item = await registryRepository(filiera(req), kind).create(parseRegistry(kind, req.body, false))
  res.status(201).json({ item })
}
