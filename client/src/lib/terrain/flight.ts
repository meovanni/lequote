// Il volo della camera sul rilievo (sezione Territorio): dal mare verso Roseto, poi sopra il Gran
// Sasso fino a Cerchio, e infine la vista d'insieme. progress 0-1 viene dallo scroll (desktop) o
// dal tempo (telefono). Coordinate del mondo in km, come lib/terrain/geo.ts:
// Roseto ≈ (5, -41), Gran Sasso ≈ (-32, -19), Cerchio ≈ (-29, 26).

export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }
type Keyframe = Pose & { at: number }

export const KEYFRAMES: Keyframe[] = [
  // Dal mare, bassi sull'acqua e con lo sguardo orizzontale: la costa, Roseto e i monti dietro.
  { at: 0, position: [30, 4, -36], target: [-40, 4, -40] },
  // Vicini a Roseto.
  { at: 0.28, position: [19, 3.4, -33], target: [3, 0.6, -42] },
  // Ci si alza sulla costa e si gira verso il Gran Sasso.
  { at: 0.45, position: [14, 11, -36], target: [-30, 4, -20] },
  // Sopra i monti, rivolti a sud verso la Marsica.
  { at: 0.62, position: [-6, 24, -6], target: [-28, 2, 24] },
  // Cerchio è in fondo alla conca del Fucino: dall'alto e da nord, perché i crinali non lo coprano.
  { at: 0.76, position: [-27, 22, 9], target: [-29, 1.5, 26] },
  // Vista d'insieme: le due sedi insieme sul rilievo.
  { at: 1, position: [30, 62, 52], target: [-12, 0, -6] },
]

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (t: number) => t * t * (3 - 2 * t)

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t
  const t3 = t2 * t
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
}

function curve(points: Vec3[], index: number, t: number): Vec3 {
  const at = (i: number) => points[Math.min(points.length - 1, Math.max(0, i))]
  const [a, b, c, d] = [at(index - 1), at(index), at(index + 1), at(index + 2)]
  return [0, 1, 2].map((axis) => catmullRom(a[axis], b[axis], c[axis], d[axis], t)) as Vec3
}

/**
 * Posizione e punto guardato a un dato progress: curva morbida che passa per ogni keyframe.
 * dolly > 1 allontana la camera dal punto guardato lungo la stessa direzione (schermi stretti).
 */
export function poseAt(progress: number, keyframes: Keyframe[] = KEYFRAMES, dolly = 1): Pose {
  const p = clamp01(progress)
  const next = keyframes.findIndex((frame) => frame.at >= p)
  const index = Math.max(0, (next === -1 ? keyframes.length - 1 : next) - 1)
  const from = keyframes[index]
  const to = keyframes[Math.min(keyframes.length - 1, index + 1)]
  const span = to.at - from.at
  const t = span > 0 ? smooth(clamp01((p - from.at) / span)) : 0
  const position = curve(
    keyframes.map((frame) => frame.position),
    index,
    t,
  )
  const target = curve(
    keyframes.map((frame) => frame.target),
    index,
    t,
  )
  return { position: position.map((value, axis) => target[axis] + (value - target[axis]) * dolly) as Vec3, target }
}

// Campo visivo orizzontale di riferimento (desktop 16:10 con 34° verticali). In verticale, sul
// telefono, si allarga il verticale per non perdere Roseto e Cerchio ai lati, fino a un tetto
// oltre il quale la prospettiva si deformerebbe.
const HORIZONTAL_FOV = 52
const MAX_VERTICAL_FOV = 62

/** Campo visivo verticale (gradi) per un rapporto larghezza/altezza. */
export function fovForAspect(aspect: number): number {
  const half = (HORIZONTAL_FOV / 2) * (Math.PI / 180)
  const vertical = 2 * Math.atan(Math.tan(half) / Math.max(0.1, aspect)) * (180 / Math.PI)
  return Math.min(MAX_VERTICAL_FOV, vertical)
}

/** Quanto allontanare la camera perché in orizzontale si veda quanto sul desktop: 1 se il campo basta. */
export function dollyForAspect(aspect: number): number {
  const toRad = Math.PI / 180
  const horizontal = 2 * Math.atan(Math.tan((fovForAspect(aspect) / 2) * toRad) * aspect)
  return Math.max(1, Math.tan((HORIZONTAL_FOV / 2) * toRad) / Math.tan(horizontal / 2))
}

/** Avvicina current a target con uno smorzamento indipendente dal frame rate. */
export function damp(current: number, target: number, lambda: number, deltaSeconds: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds))
}
