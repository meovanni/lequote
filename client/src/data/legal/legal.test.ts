import { describe, expect, it } from 'vitest'
import { LEGAL_PAGES, legalByLocale } from '.'

describe('pagine legali nelle tre lingue', () => {
  const { it: base, en, de } = legalByLocale

  it('ogni lingua ha tutte le pagine, con le stesse sezioni e le stesse fonti dell’italiano', () => {
    for (const other of [en, de]) {
      for (const page of LEGAL_PAGES) {
        const reference = base.documents[page].sections
        const translated = other.documents[page].sections
        expect(translated.map((section) => section.id)).toEqual(reference.map((section) => section.id))
        expect(translated.map((section) => section.sources)).toEqual(reference.map((section) => section.sources))
        translated.forEach((section, index) => {
          expect(section.body).toHaveLength(reference[index].body.length)
        })
      }
    }
  })

  it('solo le traduzioni dicono che prevale il testo italiano', () => {
    expect(base.ui.translationNotice).toBeUndefined()
    expect(en.ui.translationNotice).toBeTruthy()
    expect(de.ui.translationNotice).toBeTruthy()
  })

  it('il modulo tipo di recesso ha tutte le voci dell’Allegato I, parte B', () => {
    for (const content of [base, en, de]) {
      const form = content.documents.recesso.sections.find((section) => section.id === 'modulo')!
      const list = form.body.find((block) => typeof block !== 'string')
      expect(list && typeof list !== 'string' ? list.list : []).toHaveLength(8)
    }
  })
})
