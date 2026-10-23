import { BufferGeometry, Color, Float32BufferAttribute, PlaneGeometry, SRGBColorSpace } from 'three'
import { elevationColor, heightToWorld, sampleHeight } from '@/lib/terrain/geo'
import type { TerrainData } from '@/lib/terrain/load'
import { coastXAt, insidePolygon, longestRun, nearestOnPolygon, type Point } from '@/lib/terrain/shape'

/** Fondo del plastico: i bordi scendono fin qui, appoggiati sul piano. */
export const BASE_Y = -2.4
/** Il mare sta appena sotto la costa, così le onde la lambiscono senza coprirla. */
export const SEA_LEVEL = -0.05
/** Larghezza della striscia di Adriatico davanti alla costa. */
const SEA_WIDTH_KM = 22
/** Passo verso est (km) per capire se un punto del confine dà sul mare. */
const COAST_PROBE_KM = 1.5
/** Foci e porti spezzano la costa per qualche punto del contorno (circa 0,6 km l'uno). */
const COAST_GAP_POINTS = 12

export type Model = {
  outline: Point[]
  coast: Point[]
  /** Centro e raggio dell'ingombro (terra + mare), per inquadrarlo intero. */
  center: [number, number, number]
  radius: number
}

const toUv = (data: TerrainData, [x, z]: Point): [number, number] => [x / data.meta.widthKm + 0.5, z / data.meta.heightKm + 0.5]

/** Quota in metri in un punto del mondo. */
export function metersAt(data: TerrainData, point: Point): number {
  const [w, h] = data.meta.grid
  const [u, v] = toUv(data, point)
  return Math.max(0, sampleHeight(data.heights, w, h, u, v))
}

/** Contorno, costa, centro e raggio del plastico. */
export function describeModel(data: TerrainData): Model {
  const { widthKm, heightKm } = data.meta
  // Il contorno del file è chiuso (l'ultimo punto ripete il primo): qui serve aperto.
  const outline = data.meta.outline.slice(0, -1).map(([u, v]): Point => [(u - 0.5) * widthKm, (v - 0.5) * heightKm])

  const flags = outline.map(([x, z]) => {
    const probe: Point = [x + COAST_PROBE_KM, z]
    return metersAt(data, probe) < 1 && !insidePolygon(probe, outline)
  })
  const run = longestRun(flags, COAST_GAP_POINTS).map((index) => outline[index])
  const ordered = run.length > 1 && run[0][1] > run[run.length - 1][1] ? [...run].reverse() : run
  // Da nord a sud con z sempre crescente: coastXAt interpola su z.
  const coast = ordered.reduce<Point[]>((kept, point) => (kept.length === 0 || point[1] > kept[kept.length - 1][1] ? [...kept, point] : kept), [])

  const xs = [...outline.map(([x]) => x), ...coast.map(([x]) => x + SEA_WIDTH_KM)]
  const zs = outline.map(([, z]) => z)
  const [minX, maxX, minZ, maxZ] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]
  const center: [number, number, number] = [(minX + maxX) / 2, 1.5, (minZ + maxZ) / 2]
  // Inquadrato a 45°, l'ingombro in profondità si accorcia: la semidiagonale piena sprecherebbe spazio.
  const radius = (Math.hypot(maxX - minX, maxZ - minZ) / 2) * 0.79
  return { outline, coast, center, radius }
}

/** Terra: griglia con le quote, ritagliata sul confine; i vertici appena fuori si posano sul confine. */
export function buildLandGeometry(data: TerrainData, model: Model, segments: number): BufferGeometry {
  const { widthKm, heightKm } = data.meta
  const segX = segments
  const segY = Math.round((segments * heightKm) / widthKm)
  const grid = new PlaneGeometry(widthKm, heightKm, segX, segY)
  grid.rotateX(-Math.PI / 2)
  const positions = grid.attributes.position
  const count = positions.count
  // Dentro/fuori dalla maschera della regione (canale B della mappa): costa O(1) per vertice,
  // mentre il test sul poligono, su ~160 000 vertici, bloccherebbe la pagina.
  const [w, h] = data.meta.grid
  const inside = Array.from({ length: count }, (_, i) => {
    const [u, v] = toUv(data, [positions.getX(i), positions.getZ(i)])
    return sampleHeight(data.mask, w, h, u, v) >= 0.5
  })

  const source = grid.index!.array
  const kept: number[] = []
  for (let t = 0; t < source.length; t += 3) {
    const [a, b, c] = [source[t], source[t + 1], source[t + 2]]
    if (inside[a] || inside[b] || inside[c]) kept.push(a, b, c)
  }

  const colors = new Float32Array(count * 3)
  const color = new Color()
  const used = new Set(kept)
  used.forEach((i) => {
    const point: Point = inside[i] ? [positions.getX(i), positions.getZ(i)] : nearestOnPolygon([positions.getX(i), positions.getZ(i)], model.outline)
    const meters = metersAt(data, point)
    positions.setXYZ(i, point[0], heightToWorld(meters), point[1])
    color.setRGB(...elevationColor(meters), SRGBColorSpace)
    colors.set([color.r, color.g, color.b], i * 3)
  })

  const land = new BufferGeometry()
  land.setAttribute('position', positions.clone())
  land.setAttribute('color', new Float32BufferAttribute(colors, 3))
  land.setIndex(kept)
  land.computeVertexNormals()
  grid.dispose()
  return land
}

/** Bordo verticale lungo una linea (chiusa o no), dalla quota top(punto) fino al fondo. */
export function buildWallGeometry(line: Point[], top: (point: Point) => number, closed: boolean): BufferGeometry {
  const segments = closed ? line.length : line.length - 1
  const positions: number[] = []
  for (let i = 0; i < segments; i++) {
    const a = line[i]
    const b = line[(i + 1) % line.length]
    const [ta, tb] = [top(a), top(b)]
    positions.push(a[0], ta, a[1], a[0], BASE_Y, a[1], b[0], tb, b[1], b[0], tb, b[1], a[0], BASE_Y, a[1], b[0], BASE_Y, b[1])
  }
  const wall = new BufferGeometry()
  wall.setAttribute('position', new Float32BufferAttribute(positions, 3))
  wall.computeVertexNormals()
  return wall
}

/** Mare: una striscia larga SEA_WIDTH_KM che segue la costa, fitta abbastanza per le onde. */
export function buildSeaGeometry(model: Model, along: number, across: number): BufferGeometry {
  const { coast } = model
  const [north, south] = [coast[0][1], coast[coast.length - 1][1]]
  const positions: number[] = []
  for (let j = 0; j <= along; j++) {
    const z = north + ((south - north) * j) / along
    const coastX = coastXAt(coast, z)
    for (let i = 0; i <= across; i++) positions.push(coastX + (SEA_WIDTH_KM * i) / across, SEA_LEVEL, z)
  }
  const index: number[] = []
  const row = across + 1
  for (let j = 0; j < along; j++) {
    for (let i = 0; i < across; i++) {
      const a = j * row + i
      index.push(a, a + row, a + 1, a + 1, a + row, a + row + 1)
    }
  }
  const sea = new BufferGeometry()
  sea.setAttribute('position', new Float32BufferAttribute(positions, 3))
  sea.setIndex(index)
  sea.computeVertexNormals()
  return sea
}

/** Il bordo esterno del mare (nord, largo, sud): il lato della costa lo copre già la terra. */
export function seaEdge(model: Model): Point[] {
  const { coast } = model
  const [first, last] = [coast[0], coast[coast.length - 1]]
  return [first, ...coast.map(([x, z]): Point => [x + SEA_WIDTH_KM, z]), last]
}
