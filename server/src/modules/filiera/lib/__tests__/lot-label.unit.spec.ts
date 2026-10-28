import { bestBeforeFor, defaultBestBefore, formatNominalQuantity, nominalQuantityValue } from '../lot-label'

const day = (date: Date | undefined) => date?.toISOString().slice(0, 10)

describe('quantità nominale', () => {
  it('legge il numero, anche dai lotti scritti a mano', () => {
    expect(nominalQuantityValue('0.75')).toBe(0.75)
    expect(nominalQuantityValue('0,75 l')).toBe(0.75)
    expect(nominalQuantityValue('5')).toBe(5)
    expect(nominalQuantityValue(null)).toBeNull()
    expect(nominalQuantityValue('mezzo chilo')).toBeNull()
  })

  it('la mostra con l’unità della linea', () => {
    expect(formatNominalQuantity('0.75', 'olio')).toBe('0,75 L')
    expect(formatNominalQuantity('0,5 kg', 'miele')).toBe('0,5 kg')
    expect(formatNominalQuantity('5', 'olio')).toBe('5 L')
    expect(formatNominalQuantity(null, 'olio')).toBeNull()
  })
})

describe('termine minimo di conservazione', () => {
  it('propone 18 mesi dal confezionamento', () => {
    expect(day(defaultBestBefore('2026-11-15'))).toBe('2028-05-15')
    expect(day(defaultBestBefore('2026-08-31'))).toBe('2028-02-29')
  })

  it('si calcola quando arriva il confezionamento e non c’è ancora un termine', () => {
    expect(day(bestBeforeFor({ packaging_date: null, best_before: null }, { packaging_date: '2026-11-15' }))).toBe('2028-05-15')
  })

  it('segue il confezionamento finché nessuno lo cambia a mano', () => {
    const current = { packaging_date: '2026-11-15', best_before: '2028-05-15' }
    expect(day(bestBeforeFor(current, { packaging_date: '2026-12-01' }))).toBe('2028-06-01')
  })

  it('non tocca un termine scritto a mano né uno inviato insieme', () => {
    expect(bestBeforeFor({ packaging_date: '2026-11-15', best_before: '2027-12-31' }, { packaging_date: '2026-12-01' })).toBeUndefined()
    expect(bestBeforeFor({ packaging_date: null, best_before: null }, { packaging_date: '2026-11-15', best_before: '2027-06-01' })).toBeUndefined()
    expect(bestBeforeFor({ packaging_date: '2026-11-15', best_before: null }, { notes: 'x' } as never)).toBeUndefined()
  })
})
