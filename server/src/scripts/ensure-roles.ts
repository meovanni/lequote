import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { ensureRoles } from '../lib/roles'

// Dà il ruolo di amministratore agli utenti che non ne hanno ancora uno (per esempio il primo
// account creato con "medusa user" in produzione) e crea il ruolo Agente se manca. Idempotente.
export default async function ensureRolesScript({ container }: ExecArgs) {
  const { promoted } = await ensureRoles(container)
  container.resolve(ContainerRegistrationKeys.LOGGER).info(`Ruoli a posto: ${promoted} utenti promossi ad amministratore.`)
}
