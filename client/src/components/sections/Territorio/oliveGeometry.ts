import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Matrix4, Quaternion, TubeGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Olivo procedurale in unità "albero" (alto circa 1): tronco nodoso a più fusti intrecciati, rami
// che si diramano e, sulle punte, nuvole di foglie strette. Tutto ripetibile (seme fisso).

export type OliveModel = { wood: BufferGeometry; leaves: Matrix4[]; leafColors: Color[]; fruits: Vector3[] }

const BARK_DARK = new Color('#5d5046')
const BARK_LIGHT = new Color('#9a8b78')
const LEAF_TOP = ['#55663f', '#5f7046', '#4c5c39']
const LEAF_SILVER = ['#aab49a', '#b7c0a8']

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Tubo che si assottiglia lungo la curva, con creste irregolari come la corteccia dell'olivo.
 * TubeGeometry ha raggio costante: qui ogni anello viene ridimensionato attorno al suo centro.
 */
function barkTube(curve: CatmullRomCurve3, radius: (t: number) => number, tubular: number, radial: number, seed: number) {
  const tube = new TubeGeometry(curve, tubular, 1, radial, false)
  const positions = tube.attributes.position
  const colors = new Float32Array(positions.count * 3)
  const center = new Vector3()
  const vertex = new Vector3()
  const color = new Color()
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular
    curve.getPointAt(t, center)
    for (let j = 0; j <= radial; j++) {
      const index = i * (radial + 1) + j
      const angle = (j / radial) * Math.PI * 2
      // Creste e torsioni: alcune onde lungo l'anello, ruotate man mano che si sale.
      const ridge = 1 + 0.16 * Math.sin(angle * 3 + t * 7 + seed) + 0.08 * Math.sin(angle * 7 - t * 13 + seed * 2)
      vertex.fromBufferAttribute(positions, index).sub(center).multiplyScalar(radius(t) * ridge).add(center)
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z)
      color.copy(BARK_DARK).lerp(BARK_LIGHT, 0.5 + 0.5 * Math.sin(angle * 5 + t * 21 + seed))
      colors.set([color.r, color.g, color.b], index * 3)
    }
  }
  tube.setAttribute('color', new Float32BufferAttribute(colors, 3))
  tube.computeVertexNormals()
  return tube
}

type Branch = { curve: CatmullRomCurve3; base: number; tip: number }

/** Ramo da un punto, che sale piegando verso l'esterno; restituisce la curva e le punte figlie. */
function growBranch(from: Vector3, direction: Vector3, length: number, random: () => number): CatmullRomCurve3 {
  const bend = new Vector3((random() - 0.5) * 0.5, 0.35 + random() * 0.3, (random() - 0.5) * 0.5)
  const points = [0, 0.35, 0.7, 1].map((k) =>
    from
      .clone()
      .addScaledVector(direction, length * k)
      .addScaledVector(bend, length * k * k * 0.6)
      .add(new Vector3((random() - 0.5) * 0.03, 0, (random() - 0.5) * 0.03)),
  )
  return new CatmullRomCurve3(points)
}

export function buildOlive(seed = 11): OliveModel {
  const random = seeded(seed)
  const parts: BufferGeometry[] = []
  const branches: Branch[] = []

  // Tre fusti che partono larghi dal ceppo e si avvolgono salendo.
  const stems = [0, 1, 2].map((k) => {
    const angle = (k / 3) * Math.PI * 2 + random() * 0.4
    const points = [0, 0.12, 0.26, 0.4, 0.5].map((y, i) => {
      const spread = 0.07 * (1 - i / 5) + 0.02
      const twist = angle + y * 4.2
      return new Vector3(Math.cos(twist) * spread, y, Math.sin(twist) * spread)
    })
    return new CatmullRomCurve3(points)
  })
  stems.forEach((curve, k) => parts.push(barkTube(curve, (t) => 0.055 * (1 - t * 0.45) + (t < 0.08 ? 0.03 * (1 - t / 0.08) : 0), 28, 10, k * 3.1)))

  // Rami principali dalla cima dei fusti, poi rametti; le punte reggono le foglie.
  const tips: Vector3[] = []
  stems.forEach((stem, k) => {
    const top = stem.getPointAt(1)
    for (let b = 0; b < 2; b++) {
      const angle = (k / 3) * Math.PI * 2 + (b - 0.5) * 1.1 + random() * 0.3
      const direction = new Vector3(Math.cos(angle), 0.55, Math.sin(angle)).normalize()
      const main = growBranch(top, direction, 0.26 + random() * 0.08, random)
      branches.push({ curve: main, base: 0.032, tip: 0.016 })
      for (let c = 0; c < 2; c++) {
        const from = main.getPointAt(0.55 + c * 0.35)
        const side = (c === 0 ? -1 : 1) * (0.7 + random() * 0.5)
        const subDir = direction.clone().applyAxisAngle(new Vector3(0, 1, 0), side).setY(0.7).normalize()
        const sub = growBranch(from, subDir, 0.14 + random() * 0.06, random)
        branches.push({ curve: sub, base: 0.016, tip: 0.007 })
        tips.push(sub.getPointAt(1))
      }
      tips.push(main.getPointAt(1))
    }
  })
  branches.forEach((branch, i) => parts.push(barkTube(branch.curve, (t) => branch.base + (branch.tip - branch.base) * t, 14, 7, i * 1.7)))

  // Foglie: nuvole schiacciate attorno alle punte, orientate verso l'esterno.
  const leaves: Matrix4[] = []
  const leafColors: Color[] = []
  const fruits: Vector3[] = []
  const up = new Vector3(0, 1, 0)
  tips.forEach((tip) => {
    for (let n = 0; n < 190; n++) {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const r = 0.15 * Math.cbrt(random())
      const offset = new Vector3(Math.sin(phi) * Math.cos(theta) * r * 1.2, Math.cos(phi) * r * 0.75, Math.sin(phi) * Math.sin(theta) * r * 1.2)
      const position = tip.clone().add(offset)
      const outward = offset.lengthSq() > 0 ? offset.clone().normalize() : up.clone()
      const rotation = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), outward.add(new Vector3((random() - 0.5) * 0.8, -0.2, (random() - 0.5) * 0.8)).normalize())
      rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), random() * Math.PI))
      const scale = 0.7 + random() * 0.6
      leaves.push(new Matrix4().compose(position, rotation, new Vector3(scale, scale, scale)))
      const silver = random() < 0.35
      const palette = silver ? LEAF_SILVER : LEAF_TOP
      leafColors.push(new Color(palette[Math.floor(random() * palette.length)]))
    }
    for (let f = 0; f < 4; f++) fruits.push(tip.clone().add(new Vector3((random() - 0.5) * 0.16, -0.04 - random() * 0.06, (random() - 0.5) * 0.16)))
  })

  const wood = mergeGeometries(parts.map((part) => part.toNonIndexed()))
  parts.forEach((part) => part.dispose())
  return { wood, leaves, leafColors, fruits }
}

/** Foglia lanceolata: due triangoli stretti, la base all'origine e la punta lungo x. */
export function leafGeometry() {
  const geometry = new BufferGeometry()
  const length = 0.06
  const width = 0.011
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, length * 0.45, width, 0, length, 0, 0, 0, 0, 0, length, 0, 0, length * 0.45, -width, 0], 3))
  geometry.computeVertexNormals()
  return geometry
}
