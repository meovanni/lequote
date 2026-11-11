import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'

// Controlli sulle richieste che i permessi per ruolo non coprono.

/**
 * Il sito non scrive mai metadata sul carrello: sono riservati al gestionale (firma, cliente,
 * consegna, chi ha inserito l'ordine) e finirebbero nell'ordine. Dal negozio si rifiutano.
 */
export function rejectStoreCartMetadata(req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) {
  const body = req.body as Record<string, unknown> | undefined
  if (body && 'metadata' in body) {
    return next(new MedusaError(MedusaError.Types.INVALID_DATA, 'Il carrello non accetta metadata.'))
  }
  next()
}

/**
 * Nelle anagrafiche il tipo (groves, apiaries, suppliers) sta nell'indirizzo e i permessi sono
 * legati all'indirizzo letterale: un tipo scritto con caratteri codificati (supplier%73)
 * sfuggirebbe al controllo pur arrivando alla rotta. Tipi e id non hanno caratteri da codificare.
 */
export function rejectEncodedPath(req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) {
  const path = (req.originalUrl ?? req.url ?? '').split('?')[0]
  if (path.includes('%')) {
    return next(new MedusaError(MedusaError.Types.INVALID_DATA, 'Indirizzo non valido.'))
  }
  next()
}

/**
 * Chi accetta un invito diventa l'utente con l'email dell'invito, non con una scelta da lui:
 * l'agente si riconosce dall'email, quindi sceglierla vorrebbe dire prendersi i dati di un altro.
 */
export function acceptInviteWithInvitedEmail(req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) {
  const body = req.body as Record<string, unknown> | undefined
  if (body) delete body.email
  const validated = (req as { validatedBody?: Record<string, unknown> }).validatedBody
  if (validated) delete validated.email
  next()
}
