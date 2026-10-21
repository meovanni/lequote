import { model } from '@medusajs/framework/utils'

// Agente di vendita. L'email collega l'agente al suo account del back office (ruolo Agente): chi
// entra in /app/sell con quell'email vede e registra solo le sue vendite.
export const SalesAgent = model.define('sales_agent', {
  id: model.id({ prefix: 'agt' }).primaryKey(),
  name: model.text().searchable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  active: model.boolean().default(true),
  notes: model.text().nullable(),
})
