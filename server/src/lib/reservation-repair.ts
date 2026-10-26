// Prenotazioni di magazzino rimaste orfane: righe di ordini annullati (o spariti) che tengono ancora
// merce impegnata, e totali "riservati" delle sedi che non corrispondono più alla somma delle
// prenotazioni. Succedeva con gli ordini di prova annullati prima del magazzino unico
// (lib/stock-pool.ts): la merce risultava esaurita anche dopo averla ricaricata.

export type ReservationRow = { id: string; inventory_item_id: string; location_id: string; quantity: number; line_item_id: string | null }
export type LevelRow = { id: string; inventory_item_id: string; location_id: string; reserved_quantity: number }

export type RepairPlan = {
  /** Prenotazioni da eliminare: la riga d'ordine è annullata o non esiste più. */
  orphans: ReservationRow[]
  /** Sedi il cui totale riservato va riportato alla somma delle prenotazioni rimaste. */
  levels: { id: string; inventory_item_id: string; location_id: string; from: number; to: number }[]
}

/**
 * `liveLines`: righe d'ordine di ordini non annullati. Le prenotazioni senza riga d'ordine (fatte a
 * mano dal pannello di Medusa) restano: sono una scelta di chi gestisce il magazzino.
 */
export function planReservationRepair(reservations: ReservationRow[], levels: LevelRow[], liveLines: Set<string>): RepairPlan {
  const orphans = reservations.filter((reservation) => reservation.line_item_id !== null && !liveLines.has(reservation.line_item_id))
  const orphanIds = new Set(orphans.map((reservation) => reservation.id))

  const held = new Map<string, number>()
  for (const reservation of reservations) {
    if (orphanIds.has(reservation.id)) continue
    const key = `${reservation.inventory_item_id}:${reservation.location_id}`
    held.set(key, (held.get(key) ?? 0) + reservation.quantity)
  }

  return {
    orphans,
    levels: levels.flatMap((level) => {
      const to = held.get(`${level.inventory_item_id}:${level.location_id}`) ?? 0
      return to === level.reserved_quantity
        ? []
        : [{ id: level.id, inventory_item_id: level.inventory_item_id, location_id: level.location_id, from: level.reserved_quantity, to }]
    }),
  }
}
