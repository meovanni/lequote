// Il movimento della camera sul diorama (sezione Territorio), come una ripresa su gru: un arco
// che gira piano attorno alla regione mentre l'inquadratura scivola da Roseto a Cerchio, sempre
// nello stesso verso. Nell'ultimo tratto la camera scende di quota (il plastico si inclina verso
// l'alto) e la scena sale con la pagina, così quando la sezione si sblocca il movimento continua
// nello scroll senza stacchi.
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

/** Fin qui l'arco; da qui alla fine la camera scende di quota e la scena accompagna lo scroll. */
export const FLIGHT_END = 0.84
/** Di quanti schermi sale la scena nell'ultimo tratto (il 16% finale di 420vh bloccati, circa 67vh
 * di scroll). Poco: la discesa da sola fa già salire il plastico verso l'orizzonte. Quando la
 * sezione si sblocca il diorama riempie ancora la metà alta e prosegue con la pagina. */
const EXIT_SCREENS = 0.18
/** Nella discesa la quota della camera sul punto guardato scende a questa frazione (da ~40° a ~26°). */
const DESCENT_HEIGHT = 0.6

// Il perno della rotazione resta vicino al centro della regione (≈ -8, 8): l'inquadratura parte
// spostata verso Roseto e arriva spostata verso Cerchio, senza andarci sopra, così il diorama
// gira su sé stesso invece di scorrere di lato.
export const TARGET_START: Vec3 = [-4.6, 1, -4.3]
const TARGET_BEND: Vec3 = [-8, 1.5, 4]
export const TARGET_END: Vec3 = [-13, 2, 12.5]
export const ORBIT_START: Orbit = { azimuthDeg: 21, distance: 145, height: 132 }
export const ORBIT_END: Orbit = { azimuthDeg: 46, distance: 112, height: 104 }

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

/** Zoom in avanti alla fine dell'arco (campo visivo all'86%). */
export const END_ZOOM = 0.86
/** La gru sale di tanto a metà percorso e poi riscende verso Cerchio. */
const CRANE_RISE = 14
const MAX_ROLL = 1.4 * (Math.PI / 180)

/**
 * Posizione, punto guardato, zoom e inclinazione lungo l'arco. dolly > 1 allontana la camera
 * (schermi stretti). L'arco gira sempre nello stesso verso; la gru sale e riscende, l'avvicinamento
 * si concentra nella seconda metà e lo zoom stringe piano, così il movimento non è rigido.
 */
export function poseAt(progress: number, dolly = 1): Pose {
  const t = smoother(clamp01(progress / FLIGHT_END))
  const swell = Math.sin(Math.PI * t)
  const target = bezier(TARGET_START, TARGET_BEND, TARGET_END, t)
  const azimuth = mix(ORBIT_START.azimuthDeg, ORBIT_END.azimuthDeg, t) * toRad
  // L'avvicinamento parte piano e si concentra verso Cerchio.
  const distance = mix(ORBIT_START.distance, ORBIT_END.distance, t ** 1.6) * dolly
  const height = (mix(ORBIT_START.height, ORBIT_END.height, t) + CRANE_RISE * swell) * dolly
  return {
    position: [target[0] + distance * Math.cos(azimuth), target[1] + height, target[2] + distance * Math.sin(azimuth)],
    target,
    zoom: mix(1, END_ZOOM, t),
    roll: MAX_ROLL * swell,
  }
}

/**
 * Ultimo tratto, guidato dallo scroll senza smorzamento: la camera scende di quota girando attorno
 * al punto guardato (stessa distanza), così il plastico si inclina verso l'alto davanti a chi
 * guarda; intanto scende lungo il proprio "giù" e la scena sale sullo schermo come la pagina.
 * La discesa parte e finisce morbida; lo scorrimento è lineare, come lo scroll.
 */
export function exitPose(pose: Pose, verticalFovDeg: number, progress: number): Pose {
  const e = clamp01((progress - FLIGHT_END) / (1 - FLIGHT_END))
  if (e === 0) return pose
  const descent = e * e * (3 - 2 * e)
  const offset = pose.position.map((value, axis) => value - pose.target[axis])
  const distance = Math.hypot(...offset)
  const horizontal = Math.hypot(offset[0], offset[2])
  const height = offset[1] * (1 - (1 - DESCENT_HEIGHT) * descent)
  const spread = Math.sqrt(Math.max(0, distance * distance - height * height)) / horizontal
  const lowered: Vec3 = [pose.target[0] + offset[0] * spread, pose.target[1] + height, pose.target[2] + offset[2] * spread]

  const forward = pose.target.map((value, axis) => value - lowered[axis])
  const [fx, fy, fz] = forward.map((value) => value / distance)
  // destra = avanti x su; su della camera = destra x avanti.
  const rightLength = Math.hypot(fz, fx)
  const [rx, rz] = [-fz / rightLength, fx / rightLength]
  const up = [-rz * fy, rz * fx - rx * fz, rx * fy]
  const amount = e * EXIT_SCREENS * 2 * distance * Math.tan((verticalFovDeg / 2) * toRad)
  const shift = up.map((value) => -value * amount)
  return {
    ...pose,
    position: lowered.map((value, axis) => value + shift[axis]) as Vec3,
    target: pose.target.map((value, axis) => value + shift[axis]) as Vec3,
  }
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
