import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { ensureRoles } from '../lib/roles'

// Attivazione dei ruoli (2026-10-21): crea il ruolo Agente e dà il ruolo Amministratore (super
// admin) agli utenti esistenti, che altrimenti con i ruoli attivi non vedrebbero più nulla.
// Gira una volta sola con "npm run migrate".
export default async function rbacRoles({ container }: { container: MedusaContainer }) {
  const { promoted } = await ensureRoles(container)
  container.resolve(ContainerRegistrationKeys.LOGGER).info(`Ruoli pronti: Agente creato, ${promoted} utenti resi amministratori.`)
}
