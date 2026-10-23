// Un solo magazzino per la merce vendibile. Medusa riserva ogni prodotto di un ordine in una sola
// sede e non divide mai una riga: con la merce sparsa tra Roseto e Cerchio, un ordine che supera la
// giacenza della sede più fornita verrebbe rifiutato anche se il totale basta. Per i titolari il
// limite è il totale (spostare la merce tra le sedi è un problema loro), quindi la merce libera
// delle altre sedi si tiene nel magazzino principale; quella già riservata resta dov'è.

export type PoolLevel = { location_id: string; stocked_quantity: number; reserved_quantity: number }
export type ConsolidationPlan = {
  /** Pezzi spostati nel magazzino principale. */
  moved: number
  /** Il magazzino principale non ha ancora un livello per questo articolo. */
  createMain: boolean
  updates: { location_id: string; stocked_quantity: number }[]
}

export function planConsolidation(levels: PoolLevel[], mainLocationId: string): ConsolidationPlan {
  const others = levels
    .filter((level) => level.location_id !== mainLocationId)
    .map((level) => ({ ...level, free: Math.max(0, level.stocked_quantity - level.reserved_quantity) }))
    .filter((level) => level.free > 0)
  const moved = others.reduce((sum, level) => sum + level.free, 0)
  if (moved === 0) return { moved: 0, createMain: false, updates: [] }

  const main = levels.find((level) => level.location_id === mainLocationId)
  return {
    moved,
    createMain: !main,
    updates: [
      ...others.map((level) => ({ location_id: level.location_id, stocked_quantity: level.stocked_quantity - level.free })),
      { location_id: mainLocationId, stocked_quantity: (main?.stocked_quantity ?? 0) + moved },
    ],
  }
}
