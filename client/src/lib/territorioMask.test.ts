import { describe, expect, it } from 'vitest'
import { maskFromPx, maskToPx } from './territorioMask'

describe('maschera di Territorio', () => {
  it.each([
    ['telefono verticale', 390, 844],
    ['telefono orizzontale', 844, 390],
    ['tablet verticale', 820, 1180],
    ['desktop', 1440, 900],
  ])('cresce scorrendo in avanti: %s', (_, w, h) => {
    expect(maskToPx(w, h)).toBeGreaterThan(maskFromPx(w, h))
  })

  it('su un telefono in verticale non supera la larghezza dello schermo', () => {
    expect(maskToPx(390, 844)).toBeLessThanOrEqual(390)
  })
})
