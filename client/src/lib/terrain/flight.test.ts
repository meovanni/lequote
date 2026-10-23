import { describe, expect, it } from 'vitest'
import { END_ZOOM, FLIGHT_END, ORBIT_END, ORBIT_START, damp, dollyForAspect, exitShift, fovForAspect, poseAt } from './flight'


const azimuth = (progress: number) => {
  const { position, target } = poseAt(progress)
  return Math.atan2(position[2] - target[2], position[0] - target[0])
}

describe('movimento sul diorama', () => {
  it('parte guardando Roseto e arriva su Cerchio', () => {
    expect(poseAt(0).target).toEqual([5, 0.5, -41])
    poseAt(FLIGHT_END).target.forEach((value, i) => expect(value).toBeCloseTo([-29, 2.5, 26][i]))
  })

  it("gira in un solo verso lungo l'arco", () => {
    for (let i = 1; i <= 200; i++) expect(azimuth((i / 200) * FLIGHT_END)).toBeGreaterThanOrEqual(azimuth(((i - 1) / 200) * FLIGHT_END))
    expect(azimuth(FLIGHT_END) - azimuth(0)).toBeCloseTo(((ORBIT_END.azimuthDeg - ORBIT_START.azimuthDeg) * Math.PI) / 180)
  })

  it("dopo l'arco resta ferma e la scena sale come con lo scroll", () => {
    expect(poseAt(1)).toEqual(poseAt(FLIGHT_END))
    expect(exitShift(poseAt(1), 34, FLIGHT_END)).toEqual([0, 0, 0])
    const half = exitShift(poseAt(1), 34, (FLIGHT_END + 1) / 2)
    const full = exitShift(poseAt(1), 34, 1)
    full.forEach((value, i) => expect(value).toBeCloseTo(half[i] * 2))
    // La camera scende: il mondo sale sullo schermo.
    expect(full[1]).toBeLessThan(0)
  })

  it('stringe lo zoom piano e si inclina appena, solo a metà', () => {
    expect(poseAt(0).zoom).toBe(1)
    expect(poseAt(FLIGHT_END).zoom).toBeCloseTo(END_ZOOM)
    for (let i = 1; i <= 100; i++) expect(poseAt((i / 100) * FLIGHT_END).zoom).toBeLessThanOrEqual(poseAt(((i - 1) / 100) * FLIGHT_END).zoom)
    expect(poseAt(0).roll).toBe(0)
    expect(poseAt(FLIGHT_END).roll).toBeCloseTo(0)
    expect(poseAt(FLIGHT_END / 2).roll).toBeGreaterThan(0)
    expect(poseAt(FLIGHT_END / 2).roll).toBeLessThan(0.03)
  })

  it('resta ferma fuori da 0-1', () => {
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
