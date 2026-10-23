import { describe, expect, it } from 'vitest'
import { KEYFRAMES, damp, dollyForAspect, fovForAspect, poseAt } from './flight'

const distance = (a: number[], b: number[]) => Math.hypot(...a.map((value, i) => value - b[i]))

describe('volo sul rilievo', () => {
  it('passa esattamente per ogni keyframe', () => {
    for (const frame of KEYFRAMES) {
      const pose = poseAt(frame.at)
      expect(distance(pose.position, frame.position)).toBeLessThan(1e-9)
      expect(distance(pose.target, frame.target)).toBeLessThan(1e-9)
    }
  })

  it('resta fermo fuori da 0-1', () => {
    expect(poseAt(-1)).toEqual(poseAt(0))
    expect(poseAt(2)).toEqual(poseAt(1))
  })

  it('si muove senza salti', () => {
    const steps = 400
    const jumps = Array.from({ length: steps }, (_, i) => distance(poseAt(i / steps).position, poseAt((i + 1) / steps).position))
    expect(Math.max(...jumps)).toBeLessThan(2)
  })

  it('lo smorzamento converge senza superare il bersaglio', () => {
    let value = 0
    for (let i = 0; i < 120; i++) value = damp(value, 1, 6, 1 / 60)
    expect(value).toBeGreaterThan(0.99)
    expect(value).toBeLessThanOrEqual(1)
  })

  it('allarga il campo visivo in verticale, con un tetto', () => {
    expect(fovForAspect(1.6)).toBeGreaterThan(33)
    expect(fovForAspect(1.6)).toBeLessThan(35)
    expect(fovForAspect(0.46)).toBe(62)
    expect(fovForAspect(1)).toBeGreaterThan(fovForAspect(1.6))
  })

  it('sugli schermi stretti allontana la camera, sul desktop no', () => {
    expect(dollyForAspect(1.6)).toBeCloseTo(1)
    expect(dollyForAspect(0.46)).toBeGreaterThan(1.5)
    const near = poseAt(1)
    const far = poseAt(1, KEYFRAMES, 2)
    expect(far.target).toEqual(near.target)
    expect(distance(far.position, far.target)).toBeCloseTo(2 * distance(near.position, near.target))
  })
})
