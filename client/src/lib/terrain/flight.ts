// Il movimento della camera sul diorama (sezione Territorio), come una ripresa su gru: un arco
// che gira piano attorno alla regione mentre l'inquadratura scivola da Roseto a Cerchio, sempre
// nello stesso verso. Verso la fine, senza fermarsi, la camera scende di quota (il plastico si
// inclina verso l'alto) mentre l'arco gira ancora, e la scena sale con la pagina, così quando la
// sezione si sblocca il movimento continua nello scroll senza stacchi.
// progress 0-1 viene dallo scroll (desktop) o dal tempo (telefono). Coordinate del mondo in km,
// come lib/terrain/geo.ts: Roseto ≈ (5, -41), Cerchio ≈ (-29, 26).

export type Vec3 = [number, number, number]
export type Pose = {
  position: Vec3
  target: Vec3
  /** Moltiplicatore del campo visivo: sotto 1 è uno zoom in avanti, come stringere l'obiettivo. */
  zoom: number
  /** Inclinazione della camera (radianti), appena percettibile, come una ripresa a mano. */
  roll: number
}
/** Camera attorno al punto guardato: angolo sul piano (0 = est, 90 = sud), distanza e quota. */
type Orbit = { azimuthDeg: number; distance: number; height: number }

/** Dove il racconto arriva su Cerchio: il telefono si ferma qui, sul desktop la scena inizia a salire. */
export const FLIGHT_END = 0.84
/** La discesa di quota parte prima, mentre l'arco gira ancora, e finisce con la sezione. */
export const DESCENT_START = 0.6
/** Nella discesa la quota della camera sul punto guardato scende a questa frazione (da ~40° a ~26°). */
const DESCENT_HEIGHT = 0.6
/** Di quanti schermi sale la scena dopo FLIGHT_END: poco, la discesa da sola fa già salire il
 * plastico. Parte piano e accelera, così quando la sezione si sblocca la scena è già in moto come
 * la pagina e il diorama, ancora nella metà alta, prosegue con lo scroll. */
const RISE_SCREENS = 0.2

// Il perno della rotazione resta vicino al centro della regione (≈ -8, 8): l'inquadratura parte
// spostata verso Roseto e arriva spostata verso Cerchio, senza andarci sopra, così il diorama
// gira su sé stesso invece di scorrere di lato.
export const TARGET_START: Vec3 = [-4.6, 1, -4.3]
const TARGET_BEND: Vec3 = [-8, 1.5, 4]
export const TARGET_END: Vec3 = [-13, 2, 12.5]
export const ORBIT_START: Orbit = { azimuthDeg: 21, distance: 145, height: 132 }
export const ORBIT_END: Orbit = { azimuthDeg: 58, distance: 112, height: 104 }

const toRad = Math.PI / 180
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
/** Accelera e frena come una gru vera, ma va sempre avanti: la derivata non cambia segno. */
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const smooth = (t: number) => t * t * (3 - 2 * t)
const mix = (from: number, to: number, t: number) => from + (to - from) * t

/** Curva di Bézier quadratica: il punto guardato fa un piccolo arco invece di una retta. */
function bezier(a: Vec3, b: Vec3, c: Vec3, t: number): Vec3 {
  const u = 1 - t
  return a.map((value, axis) => u * u * value + 2 * u * t * b[axis] + t * t * c[axis]) as Vec3
}

/** Zoom in avanti alla fine (campo visivo all'86%). */
export const END_ZOOM = 0.86
/** La gru sale di tanto a metà percorso e poi riscende. */
const CRANE_RISE = 14
const MAX_ROLL = 1.4 * (Math.PI / 180)

/**
 * Un solo movimento continuo su tutto il progress, senza fermate in mezzo: l'arco gira sempre
 * nello stesso verso e frena solo alla fine (la rotazione orizzontale ha una coda più lunga, così
 * prosegue anche mentre la camera scende); la gru sale e riscende; l'avvicinamento si concentra
 * nella seconda metà; lo zoom stringe piano; nell'ultimo tratto la camera scende di quota girando
 * attorno al punto guardato, alla stessa distanza, e il plastico si inclina verso l'alto.
 * dolly > 1 allontana la camera (schermi stretti).
 */
export function poseAt(progress: number, dolly = 1): Pose {
  const p = clamp01(progress)
  const t = smoother(p)
  const swell = Math.sin(Math.PI * t)
  const target = bezier(TARGET_START, TARGET_BEND, TARGET_END, t)
  // Metà frenata dolce e metà lineare: a fine percorso la rotazione è ancora in moto.
  const turn = (t + p) / 2
  const azimuth = mix(ORBIT_START.azimuthDeg, ORBIT_END.azimuthDeg, turn) * toRad
  const distance = mix(ORBIT_START.distance, ORBIT_END.distance, t ** 1.6) * dolly
  const lift = (mix(ORBIT_START.height, ORBIT_END.height, t) + CRANE_RISE * swell) * dolly

  const descent = smooth(clamp01((p - DESCENT_START) / (1 - DESCENT_START)))
  const range = Math.hypot(distance, lift)
  const height = lift * (1 - (1 - DESCENT_HEIGHT) * descent)
  const ground = Math.sqrt(Math.max(0, range * range - height * height))
  return {
    position: [target[0] + ground * Math.cos(azimuth), target[1] + height, target[2] + ground * Math.sin(azimuth)],
    target,
    zoom: mix(1, END_ZOOM, t),
    roll: MAX_ROLL * swell,
  }
}

/**
 * Salita della scena dopo FLIGHT_END, guidata dallo scroll senza smorzamento: camera e punto
 * guardato scendono lungo il "giù" della camera, così il mondo sale sullo schermo. Parte da ferma
 * e accelera (quadratica), per arrivare in moto quando la sezione si sblocca.
 */
export function riseShift(pose: Pose, verticalFovDeg: number, progress: number): Vec3 {
  const e = clamp01((progress - FLIGHT_END) / (1 - FLIGHT_END))
  if (e === 0) return [0, 0, 0]
  const forward = pose.target.map((value, axis) => value - pose.position[axis])
  const distance = Math.hypot(...forward)
  const [fx, fy, fz] = forward.map((value) => value / distance)
  // destra = avanti x su; su della camera = destra x avanti.
  const rightLength = Math.hypot(fz, fx)
  const [rx, rz] = [-fz / rightLength, fx / rightLength]
  const up = [-rz * fy, rz * fx - rx * fz, rx * fy]
  const amount = e * e * RISE_SCREENS * 2 * distance * Math.tan((verticalFovDeg / 2) * toRad)
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
