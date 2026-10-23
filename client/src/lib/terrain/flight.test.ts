import { describe, expect, it } from 'vitest'
import { END, OFFSET, START, damp, dollyForAspect, fovForAspect, poseAt } from './flight'


describe('movimento sul rilievo', () => {
  it('parte da Roseto e arriva a Cerchio', () => {
    expect(poseAt(0).target).toEqual(START)
    poseAt(1).target.forEach((value, i) => expect(value).toBeCloseTo(END[i]))
  })

  it('va sempre nello stesso verso, con lo stesso orientamento', () => {
    const direction = END.map((value, i) => value - START[i])
    let previous = poseAt(0)
    for (let i = 1; i <= 200; i++) {
      const pose = poseAt(i / 200)
      const step = pose.position.map((value, axis) => value - previous.position[axis])
      expect(step.reduce((sum, value, axis) => sum + value * direction[axis], 0)).toBeGreaterThanOrEqual(0)
      pose.position.forEach((value, axis) => expect(value - pose.target[axis]).toBeCloseTo(OFFSET[axis]))
      previous = pose
    }
  })

  it('resta fermo fuori da 0-1', () => {
    expect(poseAt(-1)).toEqual(poseAt(0))
    expect(poseAt(2)).toEqual(poseAt(1))
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
    const far = poseAt(0.5, 2)
    expect(far.target).toEqual(poseAt(0.5).target)
    far.position.forEach((value, axis) => expect(value - far.target[axis]).toBeCloseTo(OFFSET[axis] * 2))
  })

})
