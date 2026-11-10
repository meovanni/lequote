import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { z } from '@medusajs/framework/zod'
import { agentForUser, assertAgentOwnsOrder } from '../../../../../../lib/bookings/actors'
import { ddtDraft, issueDdt } from '../../../../../../lib/documenti'
import type { DdtCreate } from '../../../../documenti/validators'

// L'agente consegna: emette e stampa il DDT dei suoi ordini (le fatture restano ai titolari).

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { agent } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  res.json({ draft: await ddtDraft(req.scope, req.params.id) })
}

export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof DdtCreate>>, res: MedusaResponse) {
  const { agent, actor } = await agentForUser(req.scope, req.auth_context.actor_id)
  await assertAgentOwnsOrder(req.scope, agent.id, req.params.id)
  const document = await issueDdt(req.scope, req.params.id, req.validatedBody, `${actor.name} (agente)`)
  res.status(201).json({ document: { id: document.id, number: document.number, year: document.year } })
}
