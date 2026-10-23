// Il movimento della camera sul rilievo (sezione Territorio): un solo spostamento in linea
// retta da Roseto a Cerchio, con l'orientamento sempre uguale (dal mare, guardando a ovest e
// un po' dall'alto). Niente rotazioni né cambi di quota: un solo verso di movimento.
// progress 0-1 viene dallo scroll (desktop) o dal tempo (telefono). Coordinate del mondo in km,
// come lib/terrain/geo.ts: Roseto ≈ (5, -41), Cerchio ≈ (-29, 26).

export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }

/** Punto guardato all'inizio (Roseto, sulla costa) e alla fine (Cerchio, nella Marsica). */
export const START: Vec3 = [5, 0.5, -41]
export const END: Vec3 = [-29, 2.5, 26]
/** Dove sta la camera rispetto al punto guardato: a est, sul mare, alta e lontana. */
export const OFFSET: Vec3 = [82, 62, 20]

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
/** Parte e si ferma piano, ma va sempre avanti: la derivata non cambia mai segno. */
const smooth = (t: number) => t * t * (3 - 2 * t)

/** Posizione e punto guardato a un dato progress. dolly > 1 allontana la camera (schermi stretti). */
export function poseAt(progress: number, dolly = 1): Pose {
  const t = smooth(clamp01(progress))
  const target = START.map((from, axis) => from + (END[axis] - from) * t) as Vec3
  const position = target.map((value, axis) => value + OFFSET[axis] * dolly) as Vec3
  return { position, target }
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
