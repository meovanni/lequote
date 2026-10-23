// Giacenze degli ordini: il limite è la disponibilità totale di tutte le sedi (scelta dei titolari:
// spostare la merce è un problema loro). Medusa riserva ogni riga in una sola sede, quindi la merce
// libera si tiene in un solo magazzino (lib/stock-pool.ts) e il totale è sempre riservabile.

export type StockLevel = { location_id: string; available_quantity: number }
export type StockVariant = {
  id: string
  /** "Prodotto, formato", per i messaggi. */
  label: string
  manage_inventory: boolean
  inventory_items: { required_quantity: number; levels: StockLevel[] }[]
}
export type Shortfall = { variant_id: string; label: string; requested: number; available: number }

const locationsOf = (variant: StockVariant) => [...new Set(variant.inventory_items.flatMap((item) => item.levels.map((level) => level.location_id)))]

/** Pezzi ordinabili nella sede; null se la giacenza del formato non è gestita (nessun limite). */
export function availableAt(variant: StockVariant, locationId: string): number | null {
  if (!variant.manage_inventory || variant.inventory_items.length === 0) return null
  return Math.min(
    ...variant.inventory_items.map((item) => {
      const level = item.levels.find((candidate) => candidate.location_id === locationId)
      return Math.max(0, Math.floor((level?.available_quantity ?? 0) / Math.max(1, item.required_quantity)))
    }),
  )
}

/** Massimo ordinabile: i pezzi disponibili in tutte le sedi insieme. null se la giacenza non è gestita. */
export function totalQuantity(variant: StockVariant): number | null {
  if (!variant.manage_inventory || variant.inventory_items.length === 0) return null
  return locationsOf(variant).reduce((sum, locationId) => sum + (availableAt(variant, locationId) ?? 0), 0)
}

/**
 * Righe che superano la disponibilità. In una modifica, held sono i pezzi che l'ordine tiene già
 * riservati: restano suoi e si sommano a quelli liberi.
 */
export function stockShortfalls(
  lines: { variant_id: string; quantity: number }[],
  variants: Map<string, StockVariant>,
  held: Map<string, number> = new Map(),
): Shortfall[] {
  const requested = new Map<string, number>()
  for (const line of lines) requested.set(line.variant_id, (requested.get(line.variant_id) ?? 0) + line.quantity)
  return [...requested.entries()].flatMap(([variantId, quantity]) => {
    const variant = variants.get(variantId)
    const free = variant ? totalQuantity(variant) : null
    if (!variant || free === null) return []
    const available = free + (held.get(variantId) ?? 0)
    return quantity > available ? [{ variant_id: variantId, label: variant.label, requested: quantity, available }] : []
  })
}

export function shortfallMessage(shortfalls: Shortfall[]): string {
  const parts = shortfalls.map(
    ({ label, requested, available }) => `${label} (richiesti ${requested}, ${available > 0 ? `disponibili ${available}` : 'esaurito'})`,
  )
  return `Disponibilità insufficiente: ${parts.join('; ')}.`
}
