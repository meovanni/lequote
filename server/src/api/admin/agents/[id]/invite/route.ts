import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { createInvitesWorkflow } from '@medusajs/medusa/core-flows'
import { AGENT_ROLE_ID } from '../../../../../lib/roles'
import { VENDITE_MODULE } from '../../../../../modules/vendite'
import { renderAgentInvite } from '../../../../../modules/vendite/lib/agent-invite-email'
import type VenditeModuleService from '../../../../../modules/vendite/service'
import type { AgentInvite } from '../../../backoffice/validators'

/**
 * Account per l'agente: salva l'email sull'agente, crea un invito con il ruolo Agente e glielo
 * manda per email. L'agente sceglie la sua password e da lì entra in /app/sell. Il link torna
 * anche nella risposta: se l'email non parte, il titolare lo copia dalla scheda.
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AgentInvite>>, res: MedusaResponse) {
  const vendite: VenditeModuleService = req.scope.resolve(VENDITE_MODULE)
  const { email } = req.validatedBody
  const agent = await vendite.updateSalesAgents({ id: req.params.id, email })
  const { result } = await createInvitesWorkflow(req.scope).run({ input: { invites: [{ email, roles: [AGENT_ROLE_ID] }] } })
  const adminUrl = process.env.ADMIN_PUBLIC_URL ?? 'http://localhost:9000/app'
  const inviteUrl = `${adminUrl}/invite?token=${result[0].token}`

  let emailSent = true
  try {
    await req.scope.resolve(Modules.NOTIFICATION).createNotifications({
      to: email,
      channel: 'email',
      template: 'agent-invite',
      data: { invite_url: inviteUrl, agent_id: agent.id },
      content: renderAgentInvite({ agentName: agent.name, inviteUrl, expiresAt: new Date(result[0].expires_at) }),
    })
  } catch (error) {
    emailSent = false
    req.scope.resolve(ContainerRegistrationKeys.LOGGER).error(`Invito per ${agent.name} non inviato per email: ${String(error)}`)
  }

  res.status(201).json({ agent, invite_url: inviteUrl, email_sent: emailSent })
}
