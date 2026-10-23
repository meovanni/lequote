// Inquadratura del plastico (sezione Territorio): camera ferma a sud, inclinata di circa 45°, che
// guarda verso nord; il plastico ruota piano su sé stesso in un solo verso mentre si scorre.

/** Inclinazione della camera sul piano del tavolo. */
export const CAMERA_PITCH_DEG = 45
/** Rotazione totale del plastico lungo tutta la sezione, sempre nello stesso verso. */
export const YAW_RANGE_DEG = 24

const toRad = Math.PI / 180

/** Rotazione (radianti) attorno all'asse verticale: da -metà a +metà, crescente con il progress. */
export function yawAt(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  return (p - 0.5) * YAW_RANGE_DEG * toRad
}

/**
 * Distanza perché una sfera di raggio radius stia tutta nell'inquadratura, con fov verticale in
 * gradi e rapporto larghezza/altezza: vale il lato più stretto del campo visivo.
 */
export function fitDistance(radius: number, verticalFovDeg: number, aspect: number, margin = 1.08): number {
  const vertical = verticalFovDeg * toRad
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * aspect)
  return (radius * margin) / Math.sin(Math.min(vertical, horizontal) / 2)
}

/** Posizione della camera: a sud del centro, alla distanza data, con l'inclinazione fissa. */
export function cameraPosition(distance: number, center: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const pitch = CAMERA_PITCH_DEG * toRad
  return [center[0], center[1] + distance * Math.sin(pitch), center[2] + distance * Math.cos(pitch)]
}

/** Avvicina current a target con uno smorzamento indipendente dal frame rate. */
export function damp(current: number, target: number, lambda: number, deltaSeconds: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds))
}
