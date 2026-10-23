import { describe, expect, it } from 'vitest'
import { END, START, damp, dollyForAspect, fovForAspect, poseAt } from './flight'


describe('movimento sul diorama', () => {
  it('parte dal campo su Roseto e arriva su Cerchio', () => {
    expect(poseAt(0)).toEqual(START)
    const end = poseAt(1)
    end.position.forEach((value, i) => expect(value).toBeCloseTo(END.position[i]))
    end.target.forEach((value, i) => expect(value).toBeCloseTo(END.target[i]))
  })

  it('la camera va in linea retta, sempre nello stesso verso', () => {
    const direction = END.position.map((value, i) => value - START.position[i])
    const length = Math.hypot(...direction)
    let previous = poseAt(0).position
    for (let i = 1; i <= 200; i++) {
      const position = poseAt(i / 200).position
      const step = position.map((value, axis) => value - previous[axis])
      const along = step.reduce((sum, value, axis) => sum + value * direction[axis], 0) / length
      expect(along).toBeGreaterThanOrEqual(0)
      expect(Math.hypot(...step)).toBeCloseTo(along, 6)
      previous = position
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
    const near = poseAt(0.5)
    const far = poseAt(0.5, 2)
    expect(far.target).toEqual(near.target)
    far.position.forEach((value, axis) => expect(value - far.target[axis]).toBeCloseTo((near.position[axis] - near.target[axis]) * 2))
  })


})
