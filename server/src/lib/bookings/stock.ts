import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { shortfallMessage, stockShortfalls, type StockVariant } from './stock-rules'

type VariantRow = {
  id: string
  title: string
  manage_inventory: boolean
  product: { title: string } | null
  inventory_items: { required_quantity: number; inventory: { location_levels: { location_id: string; stocked_quantity: number; reserved_quantity: number }[] } | null }[] | null
}

const VARIANT_FIELDS = [
  'id',
  'title',
  'manage_inventory',
  'product.title',
  'inventory_items.required_quantity',
  'inventory_items.inventory.location_levels.location_id',
  // available_quantity da solo torna vuoto: si calcola da giacenza e riservato.
  'inventory_items.inventory.location_levels.stocked_quantity',
  'inventory_items.inventory.location_levels.reserved_quantity',
]

/** Formati con le giacenze disponibili per sede (stoccate meno riservate dagli ordini aperti). */
export async function stockVariants(container: MedusaContainer, variantIds?: string[]): Promise<Map<string, StockVariant>> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: 'product_variant', fields: VARIANT_FIELDS, ...(variantIds ? { filters: { id: variantIds } } : {}) })
  return new Map(
    (data as unknown as VariantRow[]).map((variant) => [
      variant.id,
      {
        id: variant.id,
        label: [variant.product?.title, variant.title].filter(Boolean).join(', '),
        manage_inventory: variant.manage_inventory,
        inventory_items: (variant.inventory_items ?? []).map((item) => ({
          required_quantity: item.required_quantity,
          levels: (item.inventory?.location_levels ?? []).map(({ location_id, stocked_quantity, reserved_quantity }) => ({
            location_id,
            available_quantity: Number(stocked_quantity ?? 0) - Number(reserved_quantity ?? 0),
          })),
        })),
      },
    ]),
  )
}

/**
 * Ferma un ordine (o una modifica) che chiede più di quanto si può riservare, con un messaggio che
 * dice cosa manca. held: pezzi che l'ordine tiene già, in una modifica.
 */
export async function assertStock(container: MedusaContainer, lines: { variant_id: string; quantity: number }[], held: Map<string, number> = new Map()) {
  const variants = await stockVariants(container, [...new Set(lines.map((line) => line.variant_id))])
  const shortfalls = stockShortfalls(lines, variants, held)
  if (shortfalls.length > 0) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, shortfallMessage(shortfalls))
}

/**
 * Se due ordini si contendono gli ultimi pezzi, il controllo passa a entrambi e Medusa ferma il
 * secondo con un messaggio tecnico in inglese: qui diventa comprensibile.
 */
export function explainInventoryError(error: unknown): unknown {
  // Gli errori dei workflow di Medusa non sono sempre istanze di Error: conta il messaggio.
  const message = typeof (error as { message?: unknown })?.message === 'string' ? (error as { message: string }).message : ''
  if (/inventory|not enough stock/i.test(message)) {
    return new MedusaError(MedusaError.Types.NOT_ALLOWED, 'La disponibilità è appena cambiata: ricarica la pagina e controlla le quantità.')
  }
  return error
}
