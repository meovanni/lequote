import { describe, expect, it } from 'vitest'
import { contentByLocale } from '.'
import { PRODUCT_HANDLES } from './handles'
import { filiera, stagioni } from './it'
import { formatPeriod, monthSegments } from '@/lib/seasons'

// Un mese sbagliato nei contenuti farebbe fallire il render dell'intera pagina: lo intercettiamo qui.
describe('contenuti statici', () => {
  it('il calendario usa solo mesi validi', () => {
    for (const track of stagioni.tracks) {
      for (const activity of track.activities) {
        expect(() => monthSegments(activity)).not.toThrow()
        expect(() => formatPeriod(activity, stagioni.monthsLong)).not.toThrow()
      }
    }
  })

  it('ogni linea di filiera ha passaggi e informazioni di legge', () => {
    for (const line of filiera.lines) {
      expect(line.steps.length).toBeGreaterThan(0)
      expect(line.legalInfo.length).toBeGreaterThan(0)
    }
  })
})

describe('contenuti nelle tre lingue', () => {
  it('ogni scheda prodotto esiste in ogni lingua, per ogni handle del catalogo', () => {
    for (const content of Object.values(contentByLocale)) {
      expect(Object.keys(content.products).sort()).toEqual([...PRODUCT_HANDLES].sort())
    }
  })

  it('le lingue traducono gli stessi formati (SKU) e le stesse voci di legge', () => {
    const { it: base, en, de } = contentByLocale
    for (const other of [en, de]) {
      for (const handle of PRODUCT_HANDLES) {
        expect(Object.keys(other.products[handle].variantLabels)).toEqual(Object.keys(base.products[handle].variantLabels))
      }
      other.filiera.lines.forEach((line, index) => {
        expect(line.line).toBe(base.filiera.lines[index].line)
        expect(line.legalInfo).toHaveLength(base.filiera.lines[index].legalInfo.length)
      })
    }
  })
})
