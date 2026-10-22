import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { ensureAgentDelivery } from '../lib/agent-delivery'

// Consegna a cura dell'agente (2026-10-22) sui database esistenti. Su un database nuovo, prima del
// seed, non c'è ancora nessuna sede: la crea il seed.
export default async function agentDelivery({ container }: ExecArgs) {
  const created = await ensureAgentDelivery(container)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(created ? 'Consegna a cura dell’agente pronta.' : 'Nessuna sede: la consegna a cura dell’agente la crea il seed.')
}
