import { describe, expect, it } from 'vitest'
import { decodeHeight, heightToWorld, sampleHeight, uvToWorld } from './geo'

describe('rilievo', () => {
  it('legge la quota dai canali R e G', () => {
    expect(decodeHeight(0, 0)).toBe(0)
    expect(decodeHeight(10, 229)).toBe(2789)
  })

  it('centra la mappa nel mondo', () => {
    const meta = { widthKm: 160, heightKm: 150 }
    expect(uvToWorld(0.5, 0.5, meta)).toEqual([0, 0])
    expect(uvToWorld(1, 0, meta)).toEqual([80, -75])
  })

  it('esagera la quota', () => {
    expect(heightToWorld(1000)).toBe(3)
  })

  it('interpola tra i punti della griglia', () => {
    const heights = new Float32Array([0, 100, 200, 300])
    expect(sampleHeight(heights, 2, 2, 0.25, 0.25)).toBe(0)
    expect(sampleHeight(heights, 2, 2, 0.75, 0.75)).toBe(300)
    expect(sampleHeight(heights, 2, 2, 0.5, 0.5)).toBe(150)
  })
})
