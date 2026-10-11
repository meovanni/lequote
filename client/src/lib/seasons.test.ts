import { describe, expect, it } from 'vitest'
import { formatPeriod, isActiveInMonth, monthSegments } from './seasons'

describe('monthSegments', () => {
  it('restituisce un unico segmento per un intervallo nello stesso anno', () => {
    expect(monthSegments({ from: 10, to: 11 })).toEqual([{ start: 10, span: 2 }])
  })

  it('gestisce un singolo mese', () => {
    expect(monthSegments({ from: 5, to: 5 })).toEqual([{ start: 5, span: 1 }])
  })

  it('spezza in due segmenti un intervallo che scavalca dicembre', () => {
    expect(monthSegments({ from: 11, to: 2 })).toEqual([
      { start: 1, span: 2 },
      { start: 11, span: 2 },
    ])
  })

  it('rifiuta mesi fuori intervallo', () => {
    expect(() => monthSegments({ from: 0, to: 3 })).toThrow(RangeError)
    expect(() => monthSegments({ from: 3, to: 13 })).toThrow(RangeError)
  })
})

describe('isActiveInMonth', () => {
  it('include gli estremi', () => {
    expect(isActiveInMonth({ from: 10, to: 11 }, 10)).toBe(true)
    expect(isActiveInMonth({ from: 10, to: 11 }, 11)).toBe(true)
    expect(isActiveInMonth({ from: 10, to: 11 }, 12)).toBe(false)
  })

  it('funziona anche a cavallo d’anno', () => {
    expect(isActiveInMonth({ from: 11, to: 2 }, 1)).toBe(true)
    expect(isActiveInMonth({ from: 11, to: 2 }, 12)).toBe(true)
    expect(isActiveInMonth({ from: 11, to: 2 }, 6)).toBe(false)
  })
})

describe('formatPeriod', () => {
  const names = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

  it('usa il solo nome del mese per un mese singolo', () => {
    expect(formatPeriod({ from: 5, to: 5 }, names)).toBe('maggio')
  })

  it('descrive un intervallo, anche a cavallo d’anno', () => {
    expect(formatPeriod({ from: 10, to: 11 }, names)).toBe('da ottobre a novembre')
    expect(formatPeriod({ from: 11, to: 2 }, names)).toBe('da novembre a febbraio')
  })
})
