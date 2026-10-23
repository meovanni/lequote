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

/** Fascia ai bordi (in frazione del lato) dove il rilievo scende e sfuma nello sfondo, come un plastico. */
export const EDGE_FADE = 0.09

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

/** 0 sul bordo della mappa, 1 all'interno oltre EDGE_FADE, con raccordo morbido. */
export function edgeFalloff(u: number, v: number): number {
  const distance = Math.min(u, 1 - u, v, 1 - v)
  const t = Math.min(1, Math.max(0, distance / EDGE_FADE))
  return t * t * (3 - 2 * t)
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
