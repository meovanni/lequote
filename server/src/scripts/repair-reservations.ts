import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MathBN, Modules } from '@medusajs/framework/utils'
import { planReservationRepair, type LevelRow, type ReservationRow } from '../lib/reservation-repair'

// Riparazione una tantum delle giacenze (lib/reservation-repair.ts). Senza argomenti mostra cosa
// farebbe; con "apply" elimina le prenotazioni di ordini annullati e riporta il totale riservato
// di ogni sede alla somma delle prenotazioni rimaste.
//   npx medusa exec ./src/scripts/repair-reservations.ts            (solo controllo)
//   npx medusa exec ./src/scripts/repair-reservations.ts apply

const toNumber = (value: unknown) => MathBN.convert(value as number).toNumber()

async function readState(container: ExecArgs['container']) {
  const inventory = container.resolve(Modules.INVENTORY)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const reservations: ReservationRow[] = (await inventory.listReservationItems({})).map((row) => ({
    id: row.id,
    inventory_item_id: row.inventory_item_id,
    location_id: row.location_id,
    quantity: toNumber(row.quantity),
    line_item_id: row.line_item_id ?? null,
  }))
  const levels: LevelRow[] = (await inventory.listInventoryLevels({})).map((row) => ({
    id: row.id,
    inventory_item_id: row.inventory_item_id,
    location_id: row.location_id,
    reserved_quantity: toNumber(row.reserved_quantity),
  }))
  const { data } = await query.graph({ entity: 'order', fields: ['id', 'status', 'items.id'], filters: { status: { $ne: 'canceled' } } })
  const liveLines = new Set((data as unknown as { items: { id: string }[] | null }[]).flatMap((order) => (order.items ?? []).map((item) => item.id)))
  return { reservations, levels, liveLines }
}

export default async function repairReservations({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apply = args.includes('apply')
  const state = await readState(container)
  const plan = planReservationRepair(state.reservations, state.levels, state.liveLines)

  for (const orphan of plan.orphans) logger.info(`Prenotazione orfana ${orphan.id}: ${orphan.quantity} pz, riga ${orphan.line_item_id}.`)
  for (const level of plan.levels) logger.info(`Sede ${level.location_id}, articolo ${level.inventory_item_id}: riservati ${level.from} → ${level.to}.`)
  if (plan.orphans.length === 0 && plan.levels.length === 0) {
    logger.info('Giacenze in ordine: niente da riparare.')
    return
  }
  if (!apply) {
    logger.info('Solo controllo: rilancia con "apply" per riparare.')
    return
  }

  const inventory = container.resolve(Modules.INVENTORY)
  if (plan.orphans.length > 0) await inventory.deleteReservationItems(plan.orphans.map((orphan) => orphan.id))

  // L'eliminazione scala i totali partendo da valori già sbagliati: si ricalcolano da capo e si
  // scrivono direttamente, perché il modulo di Medusa non espone il totale riservato.
  const fresh = await readState(container)
  const after = planReservationRepair(fresh.reservations, fresh.levels, fresh.liveLines)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  for (const level of after.levels) {
    await pg('inventory_level')
      .where({ id: level.id })
      .update({ reserved_quantity: level.to, raw_reserved_quantity: { value: String(level.to), precision: 20 } })
  }
  logger.info(`Riparate ${plan.orphans.length} prenotazioni orfane e ${after.levels.length} totali riservati.`)
}
