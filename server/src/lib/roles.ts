import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { policyName } from '../policies/lequote'

// Ruoli del back office (ruoli di Medusa, src/policies). Amministratore = il super admin che Medusa
// crea da sé (tutti i permessi); Agente = solo l'area vendita /app/sell (risorsa "sales").
export const SUPER_ADMIN_ROLE_ID = 'role_super_admin'
export const AGENT_ROLE_ID = 'role_agente'

const AGENT_POLICIES = ['read', 'create', 'update', 'delete'].map((operation) => ({
  key: `sales:${operation}`,
  name: policyName('sales', operation),
  resource: 'sales',
  operation,
  description: `Area vendita degli agenti (/app/sell): ${operation}`,
}))

/**
 * Crea (se mancano) il ruolo Agente con i suoi permessi e dà il super admin agli utenti senza
 * ruolo: con i ruoli attivi, un utente senza ruoli non apre più niente. Idempotente.
 */
export async function ensureRoles(container: MedusaContainer): Promise<{ promoted: number }> {
  const rbac = container.resolve(Modules.RBAC)
  const users = container.resolve(Modules.USER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const existingPolicies = await rbac.listRbacPolicies({ key: AGENT_POLICIES.map((policy) => policy.key) })
  const missing = AGENT_POLICIES.filter((policy) => !existingPolicies.some((existing) => existing.key === policy.key))
  const created = missing.length > 0 ? await rbac.createRbacPolicies(missing) : []
  const policyIds = [...existingPolicies, ...created].map((policy) => policy.id)

  const [role] = await rbac.listRbacRoles({ id: AGENT_ROLE_ID })
  if (!role) {
    await rbac.createRbacRoles({ id: AGENT_ROLE_ID, name: 'Agente', description: 'Area vendita: prenotazioni, pagamenti, storico e classifica.' } as never)
  }
  const linked = await rbac.listRbacRolePolicies({ role_id: AGENT_ROLE_ID })
  const toLink = policyIds.filter((id) => !linked.some((rolePolicy) => rolePolicy.policy_id === id))
  if (toLink.length > 0) {
    await rbac.createRbacRolePolicies(toLink.map((policy_id) => ({ role_id: AGENT_ROLE_ID, policy_id })))
  }

  const all = await users.listUsers({}, { select: ['id'] })
  const { data: withRoles } = await query.graph({ entity: 'user', fields: ['id', 'rbac_roles.id'], filters: { id: all.map((user) => user.id) } })
  const roleless = (withRoles as { id: string; rbac_roles?: unknown[] | null }[]).filter((user) => !user.rbac_roles?.length)
  for (const user of roleless) {
    await link.create({ [Modules.USER]: { user_id: user.id }, [Modules.RBAC]: { rbac_role_id: SUPER_ADMIN_ROLE_ID } })
  }
  return { promoted: roleless.length }
}
