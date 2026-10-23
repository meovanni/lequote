// Forma della regione nel piano x, z del mondo: serve a ritagliare il plastico sul confine vero
// dell'Abruzzo e a trovare il tratto di costa da cui parte la striscia di mare.

export type Point = [number, number]

/** Punto dentro il poligono chiuso (pari/dispari sui lati). */
export function insidePolygon([x, z]: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

/** Punto più vicino sul contorno chiuso: i vertici della griglia appena fuori si posano sul confine. */
export function nearestOnPolygon([x, z]: Point, polygon: Point[]): Point {
  let best: Point = polygon[0]
  let bestDistance = Infinity
  for (let i = 0; i < polygon.length; i++) {
    const [ax, az] = polygon[i]
    const [bx, bz] = polygon[(i + 1) % polygon.length]
    const dx = bx - ax
    const dz = bz - az
    const lengthSq = dx * dx + dz * dz
    const t = lengthSq > 0 ? Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / lengthSq)) : 0
    const px = ax + dx * t
    const pz = az + dz * t
    const distance = (px - x) ** 2 + (pz - z) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = [px, pz]
    }
  }
  return best
}

/**
 * Indici del tratto più lungo di punti consecutivi marcati (il contorno è chiuso, quindi il
 * tratto può passare dall'ultimo al primo). Buchi corti, fino a maxGap punti non marcati, non
 * interrompono il tratto: sulla costa sono foci e porti.
 */
export function longestRun(flags: boolean[], maxGap = 0): number[] {
  const n = flags.length
  if (flags.every(Boolean)) return flags.map((_, i) => i)
  const start = flags.findIndex((flag) => !flag)
  let best: number[] = []
  let current: number[] = []
  let gap: number[] = []
  for (let step = 1; step <= n; step++) {
    const index = (start + step) % n
    if (flags[index]) {
      current = current.length > 0 ? [...current, ...gap, index] : [index]
      gap = []
      if (current.length > best.length) best = current
    } else if (current.length > 0 && gap.length < maxGap) {
      gap = [...gap, index]
    } else {
      current = []
      gap = []
    }
  }
  return best
}

/** x della costa a una data z, interpolando lungo il tratto di costa ordinato da nord a sud. */
export function coastXAt(coast: Point[], z: number): number {
  if (z <= coast[0][1]) return coast[0][0]
  for (let i = 1; i < coast.length; i++) {
    const [x1, z1] = coast[i]
    if (z1 >= z) {
      const [x0, z0] = coast[i - 1]
      const t = z1 > z0 ? (z - z0) / (z1 - z0) : 0
      return x0 + (x1 - x0) * t
    }
  }
  return coast[coast.length - 1][0]
}
