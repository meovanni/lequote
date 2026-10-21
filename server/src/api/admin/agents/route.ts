import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { VENDITE_MODULE } from '../../../modules/vendite'
import type VenditeModuleService from '../../../modules/vendite/service'
import type { AgentCreate } from '../backoffice/validators'

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const agents = await vendite.listSalesAgents({}, { order: { name: 'ASC' } })
  res.json({ agents })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AgentCreate>>, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const agent = await vendite.createSalesAgents(req.validatedBody)
  res.status(201).json({ agent })
}
