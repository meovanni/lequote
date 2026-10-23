import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, Color, Euler, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3, type Object3D } from 'three'
import { seededRandom } from './random'

// Olivo segnaposto di Roseto, in unità "albero" (alto circa 1) e poi scalato nella scena. Tronco
// contorto, chioma a ciuffi di foglie strette verde scuro e argento che tremano al vento.
const LEAF_COUNT = 320
const CLUSTERS: [number, number, number, number][] = [
  [0, 0.86, 0, 0.24],
  [0.24, 0.78, 0.08, 0.18],
  [-0.22, 0.8, -0.05, 0.19],
  [0.06, 0.98, -0.12, 0.17],
  [-0.08, 0.72, 0.16, 0.15],
]
const LEAF_DARK = new Color('#5f7048')
const LEAF_SILVER = new Color('#a8b39a')
const BARK = '#6e5f50'

type Leaf = { position: Vector3; rotation: Euler; scale: Vector3; phase: number }

function makeLeaves(): Leaf[] {
  const random = seededRandom(7)
  return Array.from({ length: LEAF_COUNT }, () => {
    const [cx, cy, cz, r] = CLUSTERS[Math.floor(random() * CLUSTERS.length)]
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const distance = r * Math.cbrt(random())
    return {
      position: new Vector3(cx + distance * Math.sin(phi) * Math.cos(theta), cy + distance * Math.cos(phi) * 0.7, cz + distance * Math.sin(phi) * Math.sin(theta)),
      rotation: new Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
      scale: new Vector3(0.09, 0.022, 0.03).multiplyScalar(0.8 + random() * 0.5),
      phase: random() * Math.PI * 2,
    }
  })
}

const TRUNK = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0.05, 0.22, 0.02), new Vector3(-0.04, 0.42, -0.01), new Vector3(0.02, 0.62, 0)])
const BRANCHES = [
  new CatmullRomCurve3([new Vector3(0, 0.5, 0), new Vector3(0.14, 0.62, 0.05), new Vector3(0.24, 0.76, 0.08)]),
  new CatmullRomCurve3([new Vector3(-0.02, 0.48, 0), new Vector3(-0.14, 0.62, -0.03), new Vector3(-0.22, 0.78, -0.05)]),
]

export function OliveTree({ scale, anchor }: { scale: number; anchor: (object: Object3D | null) => void }) {
  const leaves = useMemo(makeLeaves, [])
  const canopy = useRef<Group>(null)
  const mesh = useRef<InstancedMesh>(null)
  const leafGeometry = useMemo(() => new IcosahedronGeometry(1, 0), [])
  const scratch = useMemo(() => ({ matrix: new Matrix4(), quaternion: new Quaternion(), euler: new Euler(), position: new Vector3() }), [])

  useEffect(() => () => leafGeometry.dispose(), [leafGeometry])

  useLayoutEffect(() => {
    const instanced = mesh.current
    if (!instanced) return
    leaves.forEach((_, i) => instanced.setColorAt(i, (i % 3 === 0 ? LEAF_SILVER : LEAF_DARK).clone()))
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true
  }, [leaves])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Raffiche lente sulla chioma, tremolio veloce e sfasato su ogni foglia.
    const gust = 0.6 + 0.4 * Math.sin(t * 0.45)
    if (canopy.current) canopy.current.rotation.z = Math.sin(t * 1.1) * 0.035 * gust
    const instanced = mesh.current
    if (!instanced) return
    leaves.forEach((leaf, i) => {
      const flutter = Math.sin(t * 7 + leaf.phase) * 0.45 * gust
      scratch.euler.set(leaf.rotation.x + flutter, leaf.rotation.y, leaf.rotation.z + flutter * 0.5)
      scratch.quaternion.setFromEuler(scratch.euler)
      scratch.position.copy(leaf.position)
      scratch.position.x += Math.sin(t * 1.6 + leaf.position.y * 6) * 0.01 * gust
      scratch.matrix.compose(scratch.position, scratch.quaternion, leaf.scale)
      instanced.setMatrixAt(i, scratch.matrix)
    })
    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <group scale={scale}>
      <mesh castShadow>
        <tubeGeometry args={[TRUNK, 24, 0.055, 8, false]} />
        <meshStandardMaterial color={BARK} roughness={0.9} />
      </mesh>
      {BRANCHES.map((curve, i) => (
        <mesh key={i} castShadow>
          <tubeGeometry args={[curve, 12, 0.026, 6, false]} />
          <meshStandardMaterial color={BARK} roughness={0.9} />
        </mesh>
      ))}
      <group ref={canopy} position={[0, 0.55, 0]}>
        <instancedMesh ref={mesh} args={[leafGeometry, undefined, LEAF_COUNT]} position={[0, -0.55, 0]} castShadow>
          <meshStandardMaterial roughness={0.7} />
        </instancedMesh>
      </group>
      <object3D ref={anchor} position={[0, 1.12, 0]} />
    </group>
  )
}
