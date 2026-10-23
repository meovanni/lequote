// Giacenze degli ordini. Medusa riserva ogni prodotto di un ordine in una sola sede: la prima che ne
// ha abbastanza per tutta la quantità della riga (core-flows, prepareConfirmInventoryInput), senza
// dividerla tra le sedi e senza guardare la consegna. Il massimo ordinabile è quindi la
// disponibilità della sede più fornita, non la somma delle sedi.

export type StockLevel = { location_id: string; available_quantity: number }
export type StockVariant = {
  id: string
  /** "Prodotto, formato", per i messaggi. */
  label: string
  manage_inventory: boolean
  inventory_items: { required_quantity: number; levels: StockLevel[] }[]
}
export type Shortfall = { variant_id: string; label: string; requested: number; available: number; total: number }

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

/** Massimo ordinabile in un ordine: la sede più fornita. null se la giacenza non è gestita. */
export function orderableQuantity(variant: StockVariant): number | null {
  if (!variant.manage_inventory || variant.inventory_items.length === 0) return null
  return Math.max(0, ...locationsOf(variant).map((locationId) => availableAt(variant, locationId) ?? 0))
}

/** Pezzi disponibili in tutte le sedi insieme. */
export function totalQuantity(variant: StockVariant): number | null {
  if (!variant.manage_inventory || variant.inventory_items.length === 0) return null
  return locationsOf(variant).reduce((sum, locationId) => sum + (availableAt(variant, locationId) ?? 0), 0)
}

/**
 * Righe che superano il massimo ordinabile. In una modifica, held sono i pezzi che l'ordine tiene
 * già riservati: restano suoi e si sommano a quelli liberi.
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
    const free = variant ? orderableQuantity(variant) : null
    if (!variant || free === null) return []
    const own = held.get(variantId) ?? 0
    const available = free + own
    const total = (totalQuantity(variant) ?? 0) + own
    return quantity > available ? [{ variant_id: variantId, label: variant.label, requested: quantity, available, total }] : []
  })
}

export function shortfallMessage(shortfalls: Shortfall[]): string {
  const parts = shortfalls.map(
    ({ label, requested, available }) => `${label} (richiesti ${requested}, ${available > 0 ? `disponibili ${available}` : 'esaurito'})`,
  )
  // Se le sedi insieme basterebbero, si spiega perché non va.
  const split = shortfalls.some(({ requested, total }) => requested <= total)
  return `Disponibilità insufficiente: ${parts.join('; ')}.${split ? ' Ogni prodotto di un ordine parte da una sola sede: per ordinarne di più, spostate la merce tra le sedi in Inventario.' : ''}`
}
