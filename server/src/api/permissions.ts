import type { MiddlewareRoute } from '@medusajs/framework/http'

// Permessi delle nostre rotte del back office (src/policies): GET legge, POST sull'elenco crea,
// POST su una voce (o su una sua azione) modifica, DELETE elimina. Con i ruoli di Medusa attivi,
// una rotta senza permessi dichiarati sarebbe aperta a qualsiasi account, agenti compresi.
export function guard(resource: string, base: string): MiddlewareRoute[] {
  const policy = (operation: string) => [{ resource, operation }]
  return [
    { matcher: base, methods: ['GET'], policies: policy('read') },
    { matcher: `${base}/*`, methods: ['GET'], policies: policy('read') },
    { matcher: base, methods: ['POST'], policies: policy('create') },
    { matcher: `${base}/*`, methods: ['POST'], policies: policy('update') },
    { matcher: `${base}/*`, methods: ['DELETE'], policies: policy('delete') },
  ]
}
