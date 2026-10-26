import { describe, expect, it } from 'vitest'
import { DESCENT_START, END_ZOOM, FLIGHT_END, ORBIT_END, ORBIT_START, TARGET_END, TARGET_START, damp, dollyForAspect, fovForAspect, poseAt, riseShift } from './flight'


const azimuth = (progress: number) => {
  const { position, target } = poseAt(progress)
  return Math.atan2(position[2] - target[2], position[0] - target[0])
}

const pitch = (progress: number) => {
  const { position, target } = poseAt(progress)
  const o = position.map((value, i) => value - target[i])
  return Math.atan2(o[1], Math.hypot(o[0], o[2]))
}

describe('movimento sul diorama', () => {
  it('parte dal lato di Roseto e arriva dal lato di Cerchio, girando vicino al centro', () => {
    expect(poseAt(0).target).toEqual(TARGET_START)
    poseAt(1).target.forEach((value, i) => expect(value).toBeCloseTo(TARGET_END[i]))
    // Il punto guardato non si allontana mai più di 25 km dal centro della regione.
    for (let i = 0; i <= 20; i++) {
      const [x, , z] = poseAt(i / 20).target
      expect(Math.hypot(x + 8, z - 8)).toBeLessThan(25)
    }
  })

  it('gira in un solo verso e continua a girare mentre scende', () => {
    for (let i = 1; i <= 200; i++) expect(azimuth(i / 200)).toBeGreaterThan(azimuth((i - 1) / 200))
    expect(azimuth(1) - azimuth(0)).toBeCloseTo(((ORBIT_END.azimuthDeg - ORBIT_START.azimuthDeg) * Math.PI) / 180)
    // Nel tratto della discesa la rotazione orizzontale prosegue di qualche grado.
    expect(azimuth(1) - azimuth(FLIGHT_END)).toBeGreaterThan((2 * Math.PI) / 180)
  })

  it('scende di quota solo verso la fine, in un solo verso', () => {
    expect(pitch(DESCENT_START)).toBeGreaterThan(pitch(1) / 0.7)
    for (let i = 1; i <= 50; i++) {
      const p = DESCENT_START + ((1 - DESCENT_START) * i) / 50
      expect(pitch(p)).toBeLessThanOrEqual(pitch(p - (1 - DESCENT_START) / 50) + 1e-9)
    }
  })

  it("si muove senza fermarsi tra l'arco e la discesa", () => {
    const speed = (p: number) => Math.hypot(...poseAt(p + 0.005).position.map((value, i) => value - poseAt(p - 0.005).position[i]))
    const average = speed(0.5)
    for (const p of [0.6, 0.7, 0.8, FLIGHT_END, 0.9]) expect(speed(p)).toBeGreaterThan(average * 0.15)
  })

  it('dopo FLIGHT_END la scena sale, partendo da ferma', () => {
    const pose = poseAt(1)
    expect(riseShift(pose, 34, FLIGHT_END)).toEqual([0, 0, 0])
    const half = riseShift(pose, 34, (FLIGHT_END + 1) / 2)
    const full = riseShift(pose, 34, 1)
    full.forEach((value, i) => expect(value).toBeCloseTo(half[i] * 4))
    // La camera scende: il mondo sale sullo schermo.
    expect(full[1]).toBeLessThan(0)
  })

  it('stringe lo zoom piano e si inclina appena, solo a metà', () => {
    expect(poseAt(0).zoom).toBe(1)
    expect(poseAt(1).zoom).toBeCloseTo(END_ZOOM)
    for (let i = 1; i <= 100; i++) expect(poseAt(i / 100).zoom).toBeLessThanOrEqual(poseAt((i - 1) / 100).zoom)
    expect(poseAt(0).roll).toBe(0)
    expect(poseAt(1).roll).toBeCloseTo(0)
    expect(poseAt(0.5).roll).toBeGreaterThan(0)
    expect(poseAt(0.5).roll).toBeLessThan(0.03)
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
