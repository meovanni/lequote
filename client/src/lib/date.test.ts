import { describe, expect, it } from 'vitest'
import { formatIsoDate } from './date'

describe('formatIsoDate', () => {
  it('scrive la data nella lingua della pagina, senza slittare di un giorno', () => {
    expect(formatIsoDate('it', '2027-12-31')).toBe('31 dicembre 2027')
    expect(formatIsoDate('en', '2027-12-31')).toBe('31 December 2027')
    expect(formatIsoDate('de', '2027-01-01')).toBe('1. Januar 2027')
  })

  it('lascia com’è un testo che non è una data', () => {
    expect(formatIsoDate('it', 'ottobre 2025')).toBe('ottobre 2025')
    expect(formatIsoDate('it', '2027-02-31')).toBe('2027-02-31')
    expect(formatIsoDate('it', '0,75 l')).toBe('0,75 l')
  })
})
