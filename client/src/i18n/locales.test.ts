import { describe, expect, it } from 'vitest'
import { localeFromPathname, localizePath, stripLocale } from './locales'

describe('lingue nei percorsi', () => {
  it('riconosce la lingua dal prefisso, italiano altrimenti', () => {
    expect(localeFromPathname('/')).toBe('it')
    expect(localeFromPathname('/en/')).toBe('en')
    expect(localeFromPathname('/de/lotto/L1')).toBe('de')
    expect(localeFromPathname('/it/qualcosa')).toBe('it')
    expect(localeFromPathname('/entrate')).toBe('it')
  })

  it('aggiunge e toglie il prefisso', () => {
    expect(localizePath('it', '/')).toBe('/')
    expect(localizePath('en', '/')).toBe('/en/')
    expect(localizePath('de', 'lotto/L1')).toBe('/de/lotto/L1')
    expect(stripLocale('/en')).toBe('/')
    expect(stripLocale('/de/lotto/L1')).toBe('/lotto/L1')
    expect(stripLocale('/lotto/L1')).toBe('/lotto/L1')
  })
})
