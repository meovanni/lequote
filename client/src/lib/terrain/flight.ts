// Il movimento della camera sul diorama (sezione Territorio), come una ripresa su gru: un arco
// che gira piano attorno alla regione mentre l'inquadratura scivola da Roseto a Cerchio, sempre
// nello stesso verso. Nell'ultimo tratto la scena sale sullo schermo alla velocità della pagina,
// così quando la sezione si sblocca il movimento continua nello scroll senza stacchi.
// progress 0-1 viene dallo scroll (desktop) o dal tempo (telefono). Coordinate del mondo in km,
// come lib/terrain/geo.ts: Roseto ≈ (5, -41), Cerchio ≈ (-29, 26).

export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }
/** Camera attorno al punto guardato: angolo sul piano (0 = est, 90 = sud), distanza e quota. */
type Orbit = { azimuthDeg: number; distance: number; height: number }

/** Fin qui l'arco; da qui alla fine la scena accompagna lo scroll verso l'alto. */
export const FLIGHT_END = 0.88
/** Di quanti schermi sale la scena nell'ultimo tratto: con 240vh di sezione bloccata, il 12% finale
 * dura circa 29vh di scroll, quindi 0,3 schermi vanno alla stessa velocità della pagina. Quando la
 * sezione si sblocca il diorama è ancora in vista e prosegue in alto con la pagina. */
const EXIT_SCREENS = 0.3

const TARGET_START: Vec3 = [5, 0.5, -41]
const TARGET_BEND: Vec3 = [-2, 1.5, -12]
const TARGET_END: Vec3 = [-29, 2.5, 26]
export const ORBIT_START: Orbit = { azimuthDeg: 21, distance: 145, height: 132 }
export const ORBIT_END: Orbit = { azimuthDeg: 58, distance: 112, height: 104 }

const toRad = Math.PI / 180
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
/** Accelera e frena come una gru vera, ma va sempre avanti: la derivata non cambia segno. */
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const mix = (from: number, to: number, t: number) => from + (to - from) * t

/** Curva di Bézier quadratica: il punto guardato fa un piccolo arco invece di una retta. */
function bezier(a: Vec3, b: Vec3, c: Vec3, t: number): Vec3 {
  const u = 1 - t
  return a.map((value, axis) => u * u * value + 2 * u * t * b[axis] + t * t * c[axis]) as Vec3
}

/** Posizione e punto guardato lungo l'arco. dolly > 1 allontana la camera (schermi stretti). */
export function poseAt(progress: number, dolly = 1): Pose {
  const t = smoother(clamp01(progress / FLIGHT_END))
  const target = bezier(TARGET_START, TARGET_BEND, TARGET_END, t)
  const azimuth = mix(ORBIT_START.azimuthDeg, ORBIT_END.azimuthDeg, t) * toRad
  const distance = mix(ORBIT_START.distance, ORBIT_END.distance, t) * dolly
  const height = mix(ORBIT_START.height, ORBIT_END.height, t) * dolly
  return { position: [target[0] + distance * Math.cos(azimuth), target[1] + height, target[2] + distance * Math.sin(azimuth)], target }
}

/**
 * Spostamento dell'ultimo tratto: la camera scende lungo il proprio "giù", così tutta la scena
 * sale sullo schermo come se scorresse con la pagina. Lineare nel progress, cioè nello scroll.
 */
export function exitShift(pose: Pose, verticalFovDeg: number, progress: number): Vec3 {
  const e = clamp01((progress - FLIGHT_END) / (1 - FLIGHT_END))
  if (e === 0) return [0, 0, 0]
  const forward = pose.target.map((value, axis) => value - pose.position[axis])
  const distance = Math.hypot(...forward)
  const [fx, fy, fz] = forward.map((value) => value / distance)
  // destra = avanti x su; su della camera = destra x avanti.
  const right = [-fz, 0, fx]
  const rightLength = Math.hypot(...right)
  const [rx, , rz] = right.map((value) => value / rightLength)
  const up = [-rz * fy, rz * fx - rx * fz, rx * fy]
  const screenHeight = 2 * distance * Math.tan((verticalFovDeg / 2) * toRad)
  const amount = e * EXIT_SCREENS * screenHeight
  return up.map((value) => -value * amount) as Vec3
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
