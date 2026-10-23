import { availableAt, orderableQuantity, shortfallMessage, stockShortfalls, totalQuantity, type StockVariant } from '../stock-rules'

const tank: StockVariant = {
  id: 'v_tank',
  label: 'Olio Extravergine, Latta 5 l',
  manage_inventory: true,
  inventory_items: [{ required_quantity: 1, levels: [{ location_id: 'roseto', available_quantity: 50 }, { location_id: 'cerchio', available_quantity: 12 }] }],
}

describe('disponibilità', () => {
  it('per sede, massimo ordinabile (sede più fornita) e totale', () => {
    expect(availableAt(tank, 'roseto')).toBe(50)
    expect(availableAt(tank, 'cerchio')).toBe(12)
    expect(availableAt(tank, 'altrove')).toBe(0)
    expect(orderableQuantity(tank)).toBe(50)
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
    expect(orderableQuantity(free)).toBeNull()
  })
})

describe('stockShortfalls', () => {
  const variants = new Map([[tank.id, tank]])

  it('segnala le righe oltre la sede più fornita', () => {
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 51 }], variants)).toEqual([
      { variant_id: 'v_tank', label: 'Olio Extravergine, Latta 5 l', requested: 51, available: 50, total: 62 },
    ])
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 50 }], variants)).toEqual([])
  })

  it('in una modifica conta quello che l’ordine tiene già', () => {
    const held = new Map([['v_tank', 10]])
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 60 }], variants, held)).toEqual([])
    expect(stockShortfalls([{ variant_id: 'v_tank', quantity: 61 }], variants, held)).toHaveLength(1)
  })

  it('somma le righe dello stesso formato', () => {
    const lines = [
      { variant_id: 'v_tank', quantity: 30 },
      { variant_id: 'v_tank', quantity: 30 },
    ]
    expect(stockShortfalls(lines, variants)).toHaveLength(1)
  })
})

describe('shortfallMessage', () => {
  it('dice formato, quantità richiesta e disponibile', () => {
    expect(
      shortfallMessage([
        { variant_id: 'v_tank', label: 'Olio Extravergine, Latta 5 l', requested: 70, available: 50, total: 62 },
        { variant_id: 'v_miele', label: 'Miele, Vasetto 500 g', requested: 3, available: 0, total: 0 },
      ]),
    ).toBe('Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 70, disponibili 50); Miele, Vasetto 500 g (richiesti 3, esaurito).')
  })

  it('se le sedi insieme basterebbero, spiega che un ordine usa una sola sede', () => {
    expect(shortfallMessage([{ variant_id: 'v_tank', label: 'Olio Extravergine, Latta 5 l', requested: 60, available: 50, total: 62 }])).toBe(
      'Disponibilità insufficiente: Olio Extravergine, Latta 5 l (richiesti 60, disponibili 50). Ogni prodotto di un ordine parte da una sola sede: per ordinarne di più, spostate la merce tra le sedi in Inventario.',
    )
  })
})
