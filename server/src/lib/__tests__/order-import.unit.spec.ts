import { findColumns, parseNumber, planImport, splitName, unitPriceFor } from '../order-import'

describe('parseNumber', () => {
  it('legge numeri, virgola decimale, euro e migliaia', () => {
    expect(parseNumber(10)).toBe(10)
    expect(parseNumber('10,5')).toBe(10.5)
    expect(parseNumber('€ 1.234,50')).toBe(1234.5)
    expect(parseNumber('20 L')).toBe(20)
    expect(parseNumber('75.00')).toBe(75)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber(null)).toBeNull()
    expect(parseNumber('tanto')).toBeNull()
  })
})

describe('splitName', () => {
  it('una parola è il nome, il resto il cognome', () => {
    expect(splitName('Anna')).toEqual({ first_name: 'Anna', last_name: null })
    expect(splitName('  Anna   Di Marco ')).toEqual({ first_name: 'Anna', last_name: 'Di Marco' })
  })
})

describe('findColumns', () => {
  it('riconosce le intestazioni senza badare a maiuscole e varianti', () => {
    expect(findColumns(['Nome', 'L', 'Taniche', 'Importo'])).toEqual({ name: 0, liters: 1, tanks: 2, amount: 3 })
    expect(findColumns(['cliente', 'Litri', 'totale €'])).toEqual({ name: 0, liters: 1, tanks: null, amount: 2 })
    expect(findColumns(['NOME', 'Taniche'])).toEqual({ name: 0, liters: null, tanks: 1, amount: null })
  })

  it('senza nome, o senza litri né taniche, dice cosa manca', () => {
    expect(findColumns(['L', 'Importo'])).toEqual({ error: 'Manca la colonna Nome.' })
    expect(findColumns(['Nome', 'Importo'])).toEqual({ error: 'Manca la colonna L (litri) o Taniche.' })
  })
})

describe('unitPriceFor', () => {
  it('divide l’importo per le taniche, al centesimo', () => {
    expect(unitPriceFor(150, 2)).toBe(75)
    expect(unitPriceFor(100, 3)).toBe(33.33)
  })
})

describe('planImport', () => {
  const options = { litersPerTank: 5, unitPrice: 75 }

  it('calcola le taniche dai litri e l’importo dal listino', () => {
    const plan = planImport([['Nome', 'L'], ['Anna Di Marco', 10], ['Ferri', '15']], options)
    expect(plan.error).toBeUndefined()
    expect(plan.rows).toEqual([
      expect.objectContaining({ line: 2, name: 'Anna Di Marco', first_name: 'Anna', last_name: 'Di Marco', tanks: 10 / 5, amount: 150, amountFromFile: false, warnings: [] }),
      expect.objectContaining({ line: 3, name: 'Ferri', first_name: 'Ferri', last_name: null, tanks: 3, amount: 225, amountFromFile: false }),
    ])
  })

  it('usa taniche e importo del file quando ci sono', () => {
    const plan = planImport([['Nome', 'L', 'Taniche', 'Importo'], ['Anna', 10, 2, '140,00']], options)
    expect(plan.rows[0]).toEqual(expect.objectContaining({ tanks: 2, amount: 140, amountFromFile: true, unitPrice: 70, warnings: [] }))
  })

  it('arrotonda le taniche per eccesso e segnala litri e taniche che non tornano', () => {
    const [rounded, mismatch] = planImport([['Nome', 'L', 'Taniche'], ['Anna', 12, ''], ['Ferri', 10, 3]], options).rows
    expect(rounded.tanks).toBe(3)
    expect(rounded.warnings).toEqual(['12 L non sono taniche intere: 3 taniche (15 L).'])
    expect(mismatch.tanks).toBe(3)
    expect(mismatch.warnings).toEqual(['10 L con 3 taniche da 5 L (15 L): conta il numero di taniche.'])
  })

  it('segnala quando l’importo non si divide al centesimo', () => {
    const row = planImport([['Nome', 'Taniche', 'Importo'], ['Anna', 3, 100]], options).rows[0]
    expect(row.unitPrice).toBe(33.33)
    expect(row.amount).toBe(99.99)
    expect(row.warnings).toEqual(['100,00 € non si divide per 3 taniche: 3 × 33,33 € = 99,99 €.'])
  })

  it('salta le righe vuote e segnala quelle incomplete', () => {
    const plan = planImport([['Nome', 'L'], ['', ''], ['Anna', ''], ['', 10], ['Ferri', 'tanti']], options)
    expect(plan.rows.map((row) => [row.line, row.error])).toEqual([
      [3, 'Mancano litri o taniche.'],
      [4, 'Manca il nome.'],
      [5, 'Mancano litri o taniche.'],
    ])
  })

  it('senza prezzo di listino serve l’importo nel file', () => {
    const row = planImport([['Nome', 'L'], ['Anna', 5]], { litersPerTank: 5, unitPrice: null }).rows[0]
    expect(row.error).toBe('Manca l’importo e la tanica non ha un prezzo di listino.')
  })

  it('un file senza le colonne giuste non produce righe', () => {
    expect(planImport([['Cliente', 'Importo'], ['Anna', 10]], options)).toEqual({ rows: [], error: 'Manca la colonna L (litri) o Taniche.' })
    expect(planImport([], options)).toEqual({ rows: [], error: 'Il foglio è vuoto.' })
  })
})
