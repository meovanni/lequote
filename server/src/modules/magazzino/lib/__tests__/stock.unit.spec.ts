import { linePrices, priceOf } from '../pricing'
import { availabilityBySku, deliveryMovements, lineStock, packMovements, shortfalls } from '../stock'

// 300 L di sfuso, 10 bottiglie e 2 latte pronte.
const counts = { 'OLIO-SFUSO': 300_000, 'OLIO-750ML': 10, 'OLIO-5L': 2, 'MIELE-SFUSO': 0, 'MIELE-250G': 4 }

describe('lineStock', () => {
  it('prende prima i pezzi pronti, il resto lo confeziona dallo sfuso', () => {
    const stock = lineStock('olio', counts, [
      { sku: 'OLIO-750ML', quantity: 4 },
      { sku: 'OLIO-5L', quantity: 5 },
      { sku: 'OLIO-SFUSO', quantity: 20 },
    ])
    expect(stock.total).toBe(300_000 + 10 * 750 + 2 * 5000)
    expect(stock.bulkOrdered).toBe(20_000)
    // 3 latte da confezionare (15 L) e 20 L da imbottigliare: restano 265 L di sfuso libero.
    expect(stock.freeBulk).toBe(265_000)
    expect(stock.formats).toEqual([
      { sku: 'OLIO-750ML', ready: 10, ordered: 4, toPack: 0, available: 6 + Math.floor(265_000 / 750) },
      { sku: 'OLIO-5L', ready: 2, ordered: 5, toPack: 3, available: 53 },
    ])
    expect(stock.free).toBe(265_000 + 6 * 750)
    expect(stock.bulkAvailable).toBe(265)
  })

  it('segnala lo sfuso che manca quando gli ordini chiedono più di quanto c’è', () => {
    const stock = lineStock('miele', counts, [{ sku: 'MIELE-500G', quantity: 3 }])
    expect(stock.freeBulk).toBe(-1500)
    expect(stock.formats.find((row) => row.sku === 'MIELE-250G')?.available).toBe(4)
    expect(stock.bulkAvailable).toBe(0)
  })
})

describe('shortfalls', () => {
  it('accetta quello che stanno nei pezzi pronti e nello sfuso libero', () => {
    expect(shortfalls(counts, [], [{ sku: 'OLIO-5L', quantity: 62 }])).toEqual([])
    expect(shortfalls(counts, [], [{ sku: 'MIELE-250G', quantity: 4 }])).toEqual([])
  })

  it('controlla insieme le righe che pescano dallo stesso sfuso', () => {
    const result = shortfalls(counts, [], [
      { sku: 'OLIO-5L', quantity: 40 },
      { sku: 'OLIO-SFUSO', quantity: 200 },
    ])
    expect(result).toEqual([
      { sku: 'OLIO-5L', requested: 40, available: 62 },
      { sku: 'OLIO-SFUSO', requested: 200, available: 300 },
    ])
  })

  it('tiene conto degli altri ordini aperti', () => {
    expect(shortfalls(counts, [{ sku: 'MIELE-250G', quantity: 3 }], [{ sku: 'MIELE-250G', quantity: 2 }])).toEqual([
      { sku: 'MIELE-250G', requested: 2, available: 1 },
    ])
  })
})

describe('availabilityBySku', () => {
  it('dice quanto si può ancora ordinare di ogni formato e dello sfuso', () => {
    expect(availabilityBySku(counts, [])).toMatchObject({ 'OLIO-SFUSO': 300, 'OLIO-5L': 62, 'MIELE-250G': 4, 'MIELE-500G': 0, 'MIELE-SFUSO': 0 })
  })
})

describe('movimenti', () => {
  it('alla consegna scala prima i pezzi pronti, poi lo sfuso', () => {
    expect(deliveryMovements(counts, [
      { sku: 'OLIO-5L', quantity: 3 },
      { sku: 'OLIO-SFUSO', quantity: 20 },
      { sku: 'OLIO-750ML', quantity: 2 },
    ])).toEqual([
      { sku: 'OLIO-SFUSO', delta: -25_000 },
      { sku: 'OLIO-750ML', delta: -2 },
      { sku: 'OLIO-5L', delta: -2 },
    ])
  })

  it('confezionare sposta lo sfuso nei pezzi pronti', () => {
    expect(packMovements('OLIO-5L', 4)).toEqual([
      { sku: 'OLIO-SFUSO', delta: -20_000 },
      { sku: 'OLIO-5L', delta: 4 },
    ])
    expect(packMovements('OLIO-SFUSO', 4)).toEqual([])
  })
})

describe('listino al litro', () => {
  it('contenuto più confezione, arrotondato per eccesso ai 50 centesimi', () => {
    const oil = { unitPrice: 14, surcharges: {}, overrides: {} }
    expect(priceOf('OLIO-750ML', oil)).toBe(12)
    expect(priceOf('OLIO-5L', oil)).toBe(70)
    expect(priceOf('OLIO-SFUSO', oil)).toBe(14)
    expect(priceOf('OLIO-750ML', { ...oil, unitPrice: 15 })).toBe(13)
    expect(priceOf('OLIO-750ML', { ...oil, surcharges: { 'OLIO-750ML': 0 } })).toBe(10.5)
    expect(linePrices('miele', { unitPrice: 16, surcharges: {}, overrides: {} }).map(({ sku, price }) => [sku, price])).toEqual([
      ['MIELE-SFUSO', 16],
      ['MIELE-250G', 5.5],
      ['MIELE-500G', 9],
    ])
  })

  it('un prezzo scelto a mano resta, e si vede quanto sarebbe lo standard', () => {
    const oil = { unitPrice: 16, surcharges: {}, overrides: { 'OLIO-750ML': 12.9 } }
    expect(linePrices('olio', oil).find((entry) => entry.sku === 'OLIO-750ML')).toEqual({ sku: 'OLIO-750ML', price: 12.9, standard: 13.5, surcharge: 1.5, custom: true })
    expect(linePrices('olio', oil).find((entry) => entry.sku === 'OLIO-5L')).toMatchObject({ price: 80, custom: false })
  })
})
