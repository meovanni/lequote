import type { MedusaContainer } from '@medusajs/framework/types'
import { VENDITE_MODULE } from '../modules/vendite'
import type VenditeModuleService from '../modules/vendite/service'

// Agenti iniziali (2026-10-21). L'email si aggiunge dal back office quando si crea il loro
// account: è quella che collega l'agente all'area vendita. Gira una volta sola con "npm run migrate".
const AGENTS = ['Bruno', 'Giulia', 'Luciana']

export default async function seedAgents({ container }: { container: MedusaContainer }) {
  const vendite: VenditeModuleService = container.resolve(VENDITE_MODULE)
  const existing = await vendite.listSalesAgents({ name: AGENTS })
  const missing = AGENTS.filter((name) => !existing.some((agent) => agent.name === name))
  if (missing.length > 0) await vendite.createSalesAgents(missing.map((name) => ({ name })))
}
