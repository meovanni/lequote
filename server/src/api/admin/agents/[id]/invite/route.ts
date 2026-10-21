import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { createInvitesWorkflow } from '@medusajs/medusa/core-flows'
import { AGENT_ROLE_ID } from '../../../../../lib/roles'
import { VENDITE_MODULE } from '../../../../../modules/vendite'
import type VenditeModuleService from '../../../../../modules/vendite/service'
import type { AgentInvite } from '../../../backoffice/validators'

/**
 * Account per l'agente: salva l'email sull'agente e crea un invito con il ruolo Agente. Il link si
 * manda all'agente, che sceglie la sua password; da lì entra in /app/sell.
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AgentInvite>>, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const { email } = req.validatedBody
  const agent = await vendite.updateSalesAgents({ id: req.params.id, email })
  const { result } = await createInvitesWorkflow(req.scope).run({ input: { invites: [{ email, roles: [AGENT_ROLE_ID] }] } })
  const adminUrl = process.env.ADMIN_PUBLIC_URL ?? 'http://localhost:9000/app'
  res.status(201).json({ agent, invite_url: `${adminUrl}/invite?token=${result[0].token}` })
}
