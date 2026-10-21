import { definePolicies } from '@medusajs/framework/utils'

// Permessi delle sezioni nostre del back office (ruoli di Medusa, MEDUSA_FF_RBAC). Ogni risorsa ha
// lettura, creazione, modifica ed eliminazione; i ruoli si compongono in Impostazioni › Ruoli.
// L'Amministratore ha tutto (role_super_admin); l'Agente solo l'area vendita (sales).
const RESOURCES = {
  filiera: 'Filiera: lotti, campagne, anagrafiche, QR',
  supplier: 'Fornitori e tipologie',
  withdrawal: 'Recessi dei clienti',
  agent: 'Agenti e riepiloghi delle vendite',
  sales: 'Area vendita degli agenti (/app/sell)',
}

const OPERATIONS = { read: 'leggere', create: 'creare', update: 'modificare', delete: 'eliminare' }

export const lequotePolicies = definePolicies(
  Object.entries(RESOURCES).flatMap(([resource, label]) =>
    Object.entries(OPERATIONS).map(([operation, verb]) => ({
      name: `${resource}:${operation}`,
      resource,
      operation,
      description: `${label}: ${verb}`,
    })),
  ),
)
