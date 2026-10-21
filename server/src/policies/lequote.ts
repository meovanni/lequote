import { definePolicies } from '@medusajs/framework/utils'

// Permessi delle sezioni nostre del back office (ruoli di Medusa, MEDUSA_FF_RBAC). Il file non si
// chiama index.ts: Medusa salta quel nome quando cerca i permessi. Ogni risorsa ha
// lettura, creazione, modifica ed eliminazione; i ruoli si compongono in Impostazioni › Ruoli.
// L'Amministratore ha tutto (role_super_admin); l'Agente solo l'area vendita (sales).
const RESOURCES = {
  filiera: 'Filiera: lotti, campagne, anagrafiche, QR',
  supplier: 'Fornitori e tipologie',
  withdrawal: 'Recessi dei clienti',
  agent: 'Agenti e riepiloghi delle vendite',
  sales: 'Area vendita degli agenti (/app/sell)',
}

/** Nome nello stile di Medusa (ReadFiliera): diventa un identificatore nei tipi generati. */
export const policyName = (resource: string, operation: string) =>
  `${operation[0].toUpperCase()}${operation.slice(1)}${resource[0].toUpperCase()}${resource.slice(1)}`

const OPERATIONS = { read: 'leggere', create: 'creare', update: 'modificare', delete: 'eliminare' }

export const lequotePolicies = definePolicies(
  Object.entries(RESOURCES).flatMap(([resource, label]) =>
    Object.entries(OPERATIONS).map(([operation, verb]) => ({
      name: policyName(resource, operation),
      resource,
      operation,
      description: `${label}: ${verb}`,
    })),
  ),
)
