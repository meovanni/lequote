import { availableAt, shortfallMessage, stockShortfalls, totalQuantity, type StockVariant } from '../stock-rules'

const tank: StockVariant = {
  id: 'v_tank',
  label: 'Olio Extravergine, Latta 5 l',
  manage_inventory: true,
  inventory_items: [{ required_quantity: 1, levels: [{ location_id: 'roseto', available_quantity: 50 }, { location_id: 'cerchio', available_quantity: 12 }] }],
}

describe('disponibilità', () => {
  it('per sede e totale', () => {
    expect(availableAt(tank, 'roseto')).toBe(50)
    expect(availableAt(tank, 'cerchio')).toBe(12)
    expect(availableAt(tank, 'altrove')).toBe(0)
    expect(totalQuantity(tank)).toBe(62)
  })

  it('con più componenti vale quello che finisce prima, diviso per la quantità richiesta', () => {
    const kit: StockVariant = {
      id: 'v_kit',
      label: 'Confezione regalo',
      manage_inventory: true,
      inventory_items: [
        { required_quantity: 2, levels: [{ location_id: 'roseto', available_quantity: 9 }] },
        { required_quantity: 1, levels: [{ location_id: 'roseto', available_quantity: 7 }] },
      ],
    }
    expect(availableAt(kit, 'roseto')).toBe(4)
  })

  it('senza gestione della giacenza non c’è limite', () => {
    const free = { ...tank, manage_inventory: false }
    expect(availableAt(free, 'cerchio')).toBeNull()
    expect(totalQuantity(free)).toBeNull()
  })
})

describe('stockShortfalls', () => {
  const variants = new Map([[tank.id, tank]])

  it('il limite è la disponibilità totale', () => {
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 62 }], variants)).toEqual([])
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 63 }], variants)).toEqual([
      { variant_id: 'v_tank', label: 'Olio Extravergine, Latta 5 l', requested: 63, available: 62 },
    ])
  })

  it('in una modifica conta quello che l’ordine tiene già', () => {
    const held = new Map([['v_tank', 10]])
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 72 }], variants, held)).toEqual([])
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 73 }], variants, held)).toHaveLength(1)
  })

  it('somma le righe dello stesso formato', () => {
    const lines = [
      { variant_id: 'v_tank', quantity: 40 },
      { variant_id: 'v_tank', quantity: 40 },
    ]
    expect(stockShortfalls(lines, variants)).toHaveLength(1)
  })
})

describe('shortfallMessage', () => {
  it('dice formato, quantità richiesta e disponibile', () => {
    expect(
      shortfallMessage([
        { variant_id: 'v_tank', label: 'Olio Extravergine, Latta 5 l', requested: 70, available: 62 },
        { variant_id: 'v_miele', label: 'Miele, Vasetto 500 g', requested: 3, available: 0 },
      ]),
    ).toBe('Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 70, disponibili 62); Miele, Vasetto 500 g (richiesti 3, esaurito).')
  })
})
