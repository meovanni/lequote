import { bestBeforeFor, defaultBestBefore, nominalQuantities, packagedTotal } from '../lot-label'

const day = (date: Date | undefined) => date?.toISOString().slice(0, 10)

describe('confezioni del lotto', () => {
  it('la quantità nominale è l’elenco delle misure, dalla più piccola, senza ripetizioni', () => {
    const packages = [
      { size: 5, count: 20 },
      { size: 0.75, count: 100 },
      { size: 20, count: 10 },
      { size: 0.75, count: 12 },
    ]
    expect(nominalQuantities(packages, 'olio')).toBe('0,75 L · 5 L · 20 L')
    expect(nominalQuantities([{ size: 0.5, count: null }], 'miele')).toBe('0,5 kg')
    expect(nominalQuantities([], 'olio')).toBeNull()
    expect(nominalQuantities(null, 'olio')).toBeNull()
  })

  it('somma i litri confezionati dei formati con i pezzi', () => {
    expect(packagedTotal([{ size: 0.75, count: 100 }, { size: 5, count: 20 }, { size: 20, count: 10 }, { size: 1, count: null }])).toBe(375)
    expect(packagedTotal([{ size: 0.25, count: 3 }])).toBe(0.75)
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
