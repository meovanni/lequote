import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { z } from '@medusajs/framework/zod'
import { adminActor } from '../../../../lib/bookings/actors'
import { placeBooking } from '../../../../lib/bookings/create'
import { splitName, unitPriceFor } from '../../../../lib/order-import'
import type { OrderImport } from '../validators'

type ImportResult = { line: number; ok: boolean; order_id?: string; error?: string }

/**
 * Ordini importati da Excel: uno per riga, come un "Nuovo ordine" dal back office (inserito
 * dall'utente, consegna predefinita il ritiro, incassi da registrare). Con l'importo del file la
 * tanica ha un prezzo forzato, altrimenti vale il listino. Una riga che non va (giacenza, dati) non
 * ferma le altre: torna nell'elenco dei risultati con il motivo.
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof OrderImport>>, res: MedusaResponse) {
  const actor = await adminActor(req.scope, req.auth_context.actor_id)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { variant_id, shipping_option_id, agent_id, file_name, rows } = req.validatedBody
  const source = file_name ? `Importato da ${file_name}` : 'Importato da Excel'

  const results: ImportResult[] = []
  // In fila: ogni ordine riserva giacenza, e l'esito di una riga può dipendere da quelle prima.
  for (const row of rows) {
    try {
      const { orderId } = await placeBooking(
        req.scope,
        {
          customer: { kind: 'privato', ...splitName(row.name) },
          items: [{ variant_id, quantity: row.tanks, ...(row.amount ? { unit_price: unitPriceFor(row.amount, row.tanks) } : {}) }],
          shipping_option_id: shipping_option_id ?? null,
          agent_id: agent_id ?? null,
          notes: `${source}, riga ${row.line}`,
        },
        actor,
      )
      results.push({ line: row.line, ok: true, order_id: orderId })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.warn(`Import ordini, riga ${row.line}: ${message}`)
      results.push({ line: row.line, ok: false, error: message })
    }
  }

  res.status(201).json({ results })
}
