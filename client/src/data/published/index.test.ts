import { describe, expect, it } from 'vitest'
import { resolvePublished } from '.'
import { SELLER } from '@/data/business'
import { hero } from '@/data/content/it'

describe('resolvePublished', () => {
  it('senza modifiche pubblicate valgono i testi di partenza', () => {
    const site = resolvePublished({ texts: {}, shared: {} })
    expect(site.contentByLocale.it.hero.title).toBe(hero.title)
    expect(site.business.SELLER.vat).toBe(SELLER.vat)
  })

  it('applica i testi alla loro lingua e le foto a tutte', () => {
    const site = resolvePublished({
      texts: { en: { 'hero.title': 'The Heights', 'legal.ui.tocLabel': 'Contents' } },
      shared: { 'hero.poster': '/contenuti/immagini/foto.jpg' },
    })
    expect(site.contentByLocale.en.hero.title).toBe('The Heights')
    expect(site.contentByLocale.it.hero.title).toBe(hero.title)
    expect(site.legalByLocale.en.ui.tocLabel).toBe('Contents')
    for (const content of Object.values(site.contentByLocale)) {
      expect(content.hero.poster).toBe('/contenuti/immagini/foto.jpg')
    }
  })

  it('un dato aziendale cambiato si aggiorna anche dentro i testi legali e nei contatti', () => {
    const site = resolvePublished({ texts: {}, shared: { 'business.SELLER.vat': '01234567890', 'business.SELLER.email': 'ciao@le-quote.it' } })
    expect(site.business.SELLER.vat).toBe('01234567890')
    const legal = JSON.stringify(site.legalByLocale.it.documents)
    expect(legal).toContain('01234567890')
    expect(legal).not.toContain(SELLER.vat)
    expect(site.contentByLocale.de.contatti.email).toBe('ciao@le-quote.it')
  })

  it('le funzioni dei testi continuano a funzionare', () => {
    const site = resolvePublished({ texts: { it: { 'shop.title': 'Compra' } }, shared: {} })
    expect(site.contentByLocale.it.shop.summaryCount(2)).toBe('2 articoli')
  })
})
