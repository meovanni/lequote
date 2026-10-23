// Geometria del rilievo dell'Abruzzo (public/terrain, generato da scripts/terrain/build_abruzzo.py).
// Spazio del mondo: 1 unità = 1 km; x verso est, z verso sud, y in alto con la quota esagerata.

export type TerrainMeta = {
  widthKm: number
  heightKm: number
  maxHeightM: number
  grid: [number, number]
  outline: [number, number][]
  places: Record<'roseto' | 'cerchio', [number, number]>
}

/** Esagerazione verticale: a scala vera gli Appennini, visti da lontano, sembrerebbero piatti. */
export const VERTICAL_EXAGGERATION = 3

/** Quota in metri dai canali R e G della mappa (R * 256 + G). */
export function decodeHeight(r: number, g: number): number {
  return r * 256 + g
}

/** Da coordinate 0-1 della mappa (u verso est, v verso sud) a x, z del mondo, centrati. */
export function uvToWorld(u: number, v: number, meta: Pick<TerrainMeta, 'widthKm' | 'heightKm'>): [number, number] {
  return [(u - 0.5) * meta.widthKm, (v - 0.5) * meta.heightKm]
}

/** Quota del mondo (unità) da metri. */
export function heightToWorld(meters: number): number {
  return (meters / 1000) * VERTICAL_EXAGGERATION
}

/** Quota in metri nel punto u, v (bilineare) da una griglia di quote w x h. */
export function sampleHeight(heights: Float32Array, w: number, h: number, u: number, v: number): number {
  const x = Math.min(w - 1, Math.max(0, u * w - 0.5))
  const y = Math.min(h - 1, Math.max(0, v * h - 0.5))
  const x0 = Math.min(w - 2, Math.floor(x))
  const y0 = Math.min(h - 2, Math.floor(y))
  const fx = x - x0
  const fy = y - y0
  const at = (cx: number, cy: number) => heights[cy * w + cx]
  const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx
  const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx
  return top * (1 - fy) + bottom * fy
}

// Tinte ipsometriche smorzate: pianura costiera verde salvia, colline oliva, poi ocra, roccia e
// le cime chiare. Quote in metri, colori sRGB 0-1.
const ELEVATION_STOPS: [number, [number, number, number]][] = [
  [0, [0.62, 0.68, 0.52]],
  [300, [0.66, 0.68, 0.48]],
  [800, [0.73, 0.66, 0.5]],
  [1500, [0.64, 0.6, 0.55]],
  [2200, [0.79, 0.77, 0.73]],
  [2700, [0.95, 0.94, 0.91]],
]

/** Colore del terreno a una quota: interpolazione lineare tra le tinte vicine. */
export function elevationColor(meters: number): [number, number, number] {
  const upper = ELEVATION_STOPS.findIndex(([at]) => at >= meters)
  if (upper <= 0) return ELEVATION_STOPS[upper === 0 ? 0 : ELEVATION_STOPS.length - 1][1]
  const [fromAt, from] = ELEVATION_STOPS[upper - 1]
  const [toAt, to] = ELEVATION_STOPS[upper]
  const t = (meters - fromAt) / (toAt - fromAt)
  return [0, 1, 2].map((i) => from[i] + (to[i] - from[i]) * t) as [number, number, number]
}
