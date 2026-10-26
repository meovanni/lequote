import { planReservationRepair, type LevelRow, type ReservationRow } from '../reservation-repair'

const reservation = (id: string, quantity: number, line: string | null, item = 'bottle'): ReservationRow => ({
  id,
  inventory_item_id: item,
  location_id: 'roseto',
  quantity,
  line_item_id: line,
})
const level = (item: string, reserved: number): LevelRow => ({ id: `lvl_${item}`, inventory_item_id: item, location_id: 'roseto', reserved_quantity: reserved })

describe('planReservationRepair', () => {
  it('libera la merce degli ordini annullati e riallinea il totale riservato', () => {
    const plan = planReservationRepair(
      [reservation('r1', 2, 'open-1'), reservation('r2', 2, 'canceled-1'), reservation('r3', 2, 'open-2'), reservation('r4', 1, 'canceled-2', 'honey')],
      [level('bottle', 10), level('honey', 2)],
      new Set(['open-1', 'open-2']),
    )
    expect(plan.orphans.map((row) => row.id)).toEqual(['r2', 'r4'])
    expect(plan.levels).toEqual([
      { id: 'lvl_bottle', inventory_item_id: 'bottle', location_id: 'roseto', from: 10, to: 4 },
      { id: 'lvl_honey', inventory_item_id: 'honey', location_id: 'roseto', from: 2, to: 0 },
    ])
  })

  it('tiene le prenotazioni manuali e non tocca i totali già giusti', () => {
    const plan = planReservationRepair([reservation('r1', 3, null)], [level('bottle', 3)], new Set())
    expect(plan).toEqual({ orphans: [], levels: [] })
  })
})
