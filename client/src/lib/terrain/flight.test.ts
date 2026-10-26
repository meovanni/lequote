import { describe, expect, it } from 'vitest'
import { END_ZOOM, FLIGHT_END, ORBIT_END, ORBIT_START, TARGET_END, TARGET_START, damp, dollyForAspect, exitPose, fovForAspect, poseAt } from './flight'


const azimuth = (progress: number) => {
  const { position, target } = poseAt(progress)
  return Math.atan2(position[2] - target[2], position[0] - target[0])
}

describe('movimento sul diorama', () => {
  it('parte dal lato di Roseto e arriva dal lato di Cerchio, girando vicino al centro', () => {
    expect(poseAt(0).target).toEqual(TARGET_START)
    poseAt(FLIGHT_END).target.forEach((value, i) => expect(value).toBeCloseTo(TARGET_END[i]))
    // Il punto guardato non si allontana mai più di 25 km dal centro della regione.
    for (let i = 0; i <= 20; i++) {
      const [x, , z] = poseAt((i / 20) * FLIGHT_END).target
      expect(Math.hypot(x + 8, z - 8)).toBeLessThan(25)
    }
  })

  it("gira in un solo verso lungo l'arco", () => {
    for (let i = 1; i <= 200; i++) expect(azimuth((i / 200) * FLIGHT_END)).toBeGreaterThanOrEqual(azimuth(((i - 1) / 200) * FLIGHT_END))
    expect(azimuth(FLIGHT_END) - azimuth(0)).toBeCloseTo(((ORBIT_END.azimuthDeg - ORBIT_START.azimuthDeg) * Math.PI) / 180)
  })

  it("dopo l'arco la camera scende di quota e la scena sale come con lo scroll", () => {
    const pose = poseAt(1)
    expect(pose).toEqual(poseAt(FLIGHT_END))
    expect(exitPose(pose, 34, FLIGHT_END)).toEqual(pose)
    const pitch = (p: { position: number[]; target: number[] }) => {
      const o = p.position.map((value, i) => value - p.target[i])
      return Math.atan2(o[1], Math.hypot(o[0], o[2]))
    }
    const end = exitPose(pose, 34, 1)
    // Più bassa: l'inclinazione sull'orizzonte cala di molto, la distanza dal punto guardato no.
    expect(pitch(end)).toBeLessThan(pitch(pose) * 0.6)
    const length = (p: { position: number[]; target: number[] }) => Math.hypot(...p.position.map((value, i) => value - p.target[i]))
    expect(length(end)).toBeCloseTo(length(pose))
    // Camera e punto guardato si spostano verso il basso: il mondo sale sullo schermo.
    expect(end.target[1]).toBeLessThan(pose.target[1])
    // La discesa va in un solo verso.
    let previous = pitch(pose)
    for (let i = 1; i <= 50; i++) {
      const current = pitch(exitPose(pose, 34, FLIGHT_END + ((1 - FLIGHT_END) * i) / 50))
      expect(current).toBeLessThanOrEqual(previous + 1e-9)
      previous = current
    }
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
