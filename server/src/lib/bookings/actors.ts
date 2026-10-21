import type { MedusaContainer } from '@medusajs/framework/types'
import { MedusaError, Modules } from '@medusajs/framework/utils'
import { VENDITE_MODULE } from '../../modules/vendite'
import type VenditeModuleService from '../../modules/vendite/service'
import { agentOrderIds } from './read'
import type { Actor } from './types'

async function userOf(container: MedusaContainer, userId: string) {
  return container.resolve(Modules.USER).retrieveUser(userId)
}

/** L'utente del back office come autore di un ordine o di un incasso. */
export async function adminActor(container: MedusaContainer, userId: string): Promise<Actor> {
  const user = await userOf(container, userId)
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  return { type: 'admin', id: user.id, name }
}

/**
 * L'agente collegato all'account che fa la richiesta: stessa email, agente attivo. Senza agente
 * l'area vendita non si apre, anche per un amministratore.
 */
export async function agentForUser(container: MedusaContainer, userId: string) {
  const user = await userOf(container, userId)
  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  const [agent] = await vendite.listSalesAgents({ email: user.email.toLowerCase(), active: true })
  if (!agent) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Questo account non è collegato a un agente attivo: chiedi all’amministratore.')
  }
  const actor: Actor = { type: 'agente', id: agent.id, name: agent.name }
  return { agent, actor }
}

/** L'agente può toccare solo le prenotazioni sue. */
export async function assertAgentOwnsOrder(container: MedusaContainer, agentId: string, orderId: string) {
  if (!(await agentOrderIds(container, agentId)).includes(orderId)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Prenotazione non trovata tra le tue.')
  }
}
