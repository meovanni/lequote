import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { filiera, parseRegistry, registryKind } from '../../../helpers'
import { registryRepository } from '../../repository'

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const kind = registryKind(req.params.kind)
  const item = await registryRepository(filiera(req), kind).update(req.params.id, parseRegistry(kind, req.body, true))
  res.json({ item })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const kind = registryKind(req.params.kind)
  await filiera(req).deleteRegistryItem(kind, req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
