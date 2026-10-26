import { describe, expect, it } from 'vitest'
import { samePageHash } from './useSectionLinks'

const home = { origin: 'https://le-quote.it', pathname: '/' }

describe('samePageHash', () => {
  it('riconosce le àncore della pagina aperta, anche scritte con il percorso', () => {
    expect(samePageHash('/#olio', home)).toBe('olio')
    expect(samePageHash('#shop', home)).toBe('shop')
    expect(samePageHash('https://le-quote.it/#filiera', home)).toBe('filiera')
    expect(samePageHash('/en/#olio', { origin: 'https://le-quote.it', pathname: '/en/' })).toBe('olio')
  })

  it('lascia al browser i link verso altre pagine o altri siti', () => {
    expect(samePageHash('/#olio', { ...home, pathname: '/prodotti/miele' })).toBeNull()
    expect(samePageHash('/en/#olio', home)).toBeNull()
    expect(samePageHash('https://example.com/#olio', home)).toBeNull()
    expect(samePageHash('/', home)).toBeNull()
    expect(samePageHash('/#', home)).toBeNull()
  })
})
