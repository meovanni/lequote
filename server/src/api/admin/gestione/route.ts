import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { bookableVariants } from '../../../lib/bookings/catalog'
import { loadBookings } from '../../../lib/bookings/read'
import { stockState } from '../../../lib/magazzino'
import { currentPricing } from '../../../lib/pricing'
import { DEFAULT_PACKING, FORMATS, LINE_UNIT } from '../../../modules/magazzino/lib/formats'

/** Ordini mostrati nella pagina: gli ultimi, dal più recente. */
const ORDER_LIMIT = 300

/**
 * Tutto quello che serve alla pagina Gestione in una richiesta: magazzino (quantità, impegnato,
 * da confezionare, ordinabile), prezzi dei formati e ultimi ordini con incassi, agente e consegna.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [stock, variants, oil, honey, { data }] = await Promise.all([
    stockState(req.scope),
    bookableVariants(req.scope),
    currentPricing(req.scope, 'olio'),
    currentPricing(req.scope, 'miele'),
    query.graph({
      entity: 'order',
      fields: ['id', 'created_at', 'sales_agent.name'],
      filters: { status: { $ne: 'draft' } },
      pagination: { take: ORDER_LIMIT, order: { created_at: 'DESC' } },
    }),
  ])
  const rows = data as unknown as { id: string; sales_agent?: { name: string } | null }[]
  const agentById = new Map(rows.map((row) => [row.id, row.sales_agent?.name ?? null]))
  const bookings = await loadBookings(req.scope, rows.map((row) => row.id))

  res.json({
    lines: stock.lines.map((line) => ({
      ...line,
      unit: LINE_UNIT[line.line],
      defaultPacking: DEFAULT_PACKING[line.line],
      unitPrice: (line.line === 'olio' ? oil : honey).unitPrice,
    })),
    formats: FORMATS.map((format) => {
      const variant = variants.find((entry) => entry.sku === format.sku)
      const pricing = format.line === 'olio' ? oil : honey
      return {
        ...format,
        variantId: variant?.variantId ?? null,
        price: variant?.price ?? null,
        surcharge: format.bulk ? 0 : (pricing.surcharges[format.sku] ?? 0),
        available: stock.available[format.sku] ?? 0,
      }
    }),
    orders: bookings.map((booking) => ({ ...booking, agent: agentById.get(booking.id) ?? null })),
  })
}
