// Il movimento della camera sul diorama (sezione Territorio), come una ripresa su carrello: un
// solo tratto in linea retta, dal campo largo su Roseto e la costa al campo più stretto su
// Cerchio, che parte e si ferma morbido. Niente curve né ritorni: un solo verso di movimento.
// progress 0-1 viene dallo scroll (desktop) o dal tempo (telefono). Coordinate del mondo in km,
// come lib/terrain/geo.ts: Roseto ≈ (5, -41), Cerchio ≈ (-29, 26).

export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }

/** Inquadratura iniziale (campo largo, dal mare) e finale (più vicina, sopra la Marsica). */
// Da lontano e dall'alto (circa 42°), come i plastici fotografati: il diorama resta circondato dal bianco.
export const START: Pose = { position: [140, 132, 12], target: [5, 0.5, -41] }
export const END: Pose = { position: [72, 104, 72], target: [-29, 2.5, 26] }

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
/** Accelera e frena come un carrello vero, ma va sempre avanti: la derivata non cambia segno. */
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

const lerp = (from: Vec3, to: Vec3, t: number) => from.map((value, axis) => value + (to[axis] - value) * t) as Vec3

/** Posizione e punto guardato a un dato progress. dolly > 1 allontana la camera (schermi stretti). */
export function poseAt(progress: number, dolly = 1): Pose {
  const t = smoother(clamp01(progress))
  const target = lerp(START.target, END.target, t)
  const base = lerp(START.position, END.position, t)
  const position = base.map((value, axis) => target[axis] + (value - target[axis]) * dolly) as Vec3
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
