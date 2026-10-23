import { describe, expect, it } from 'vitest'
import { cameraPosition, damp, fitDistance, yawAt } from './view'

describe('inquadratura del plastico', () => {
  it('ruota in un solo verso lungo tutto il progress', () => {
    const yaws = Array.from({ length: 101 }, (_, i) => yawAt(i / 100))
    yaws.slice(1).forEach((yaw, i) => expect(yaw).toBeGreaterThan(yaws[i]))
    expect(yawAt(0.5)).toBe(0)
    expect(yawAt(-1)).toBe(yawAt(0))
    expect(yawAt(2)).toBe(yawAt(1))
  })

  it('su uno schermo verticale si allontana di più', () => {
    expect(fitDistance(100, 40, 0.5)).toBeGreaterThan(fitDistance(100, 40, 1.6))
  })

  it('mette la camera a sud, a 45 gradi', () => {
    const [x, y, z] = cameraPosition(100)
    expect(x).toBe(0)
    expect(y).toBeCloseTo(z)
    expect(z).toBeGreaterThan(0)
  })

  it('lo smorzamento converge senza superare il bersaglio', () => {
    let value = 0
    for (let i = 0; i < 120; i++) value = damp(value, 1, 6, 1 / 60)
    expect(value).toBeGreaterThan(0.99)
    expect(value).toBeLessThanOrEqual(1)
  })
})
