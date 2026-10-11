import { describe, expect, it } from 'vitest'
import { filiera, stagioni } from './content'
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
