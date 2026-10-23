import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Matrix4, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Arnie in miniatura, in unità "arnia" (larga circa 0,5): cavalletto, fondo con predellino e
// porticina, nido e melario verniciati, maniglie incassate, tetto sporgente; un mattone su
// qualche tetto, come nei campi veri. Intorno, qualche ape in volo.
const HIVES = [
  { color: '#f2eee4', super: true, brick: false },
  { color: '#8fb8cf', super: true, brick: true },
  { color: '#e7c35a', super: false, brick: false },
  { color: '#9fc9ad', super: true, brick: false },
  { color: '#e3957a', super: false, brick: true },
]
const SPACING = 0.78
const WOOD = '#8a6b4c'
const DARK = '#2f2924'
const ROOF = '#c8c6c0'
const BEE_COUNT = 36

type HiveProps = { color: string; withSuper: boolean; brick: boolean; box: RoundedBoxGeometry }

function Hive({ color, withSuper, brick, box }: HiveProps) {
  const paint = useMemo(() => new Color(color), [color])
  const lighter = useMemo(() => paint.clone().lerp(new Color('#ffffff'), 0.18), [paint])
  const broodTop = 0.16 + 0.3
  const superTop = withSuper ? broodTop + 0.19 : broodTop
  return (
    <group>
      {/* Cavalletto: due traversi su quattro piedi. */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={`rail${x}`} position={[x, 0.09, 0]} scale={[0.05, 0.04, 0.66]}>
          <boxGeometry />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      ))}
      {[-0.2, 0.2].flatMap((x) =>
        [-0.28, 0.28].map((z) => (
          <mesh key={`leg${x}${z}`} position={[x, 0.035, z]} scale={[0.05, 0.07, 0.05]}>
            <boxGeometry />
            <meshStandardMaterial color={WOOD} roughness={0.9} />
          </mesh>
        )),
      )}
      {/* Fondo con predellino davanti e porticina scura. */}
      <mesh position={[0, 0.13, 0.02]} scale={[0.5, 0.03, 0.66]}>
        <boxGeometry />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.16, 0.315]} scale={[0.3, 0.03, 0.006]}>
        <boxGeometry />
        <meshStandardMaterial color={DARK} roughness={1} />
      </mesh>
      {/* Nido. */}
      <mesh geometry={box} position={[0, 0.16 + 0.15, 0]} scale={[0.48, 0.3, 0.6]}>
        <meshStandardMaterial color={paint} roughness={0.7} />
      </mesh>
      {/* Melario, un poco più chiaro, con la fuga tra le casse. */}
      {withSuper && (
        <>
          <mesh position={[0, broodTop + 0.002, 0]} scale={[0.485, 0.008, 0.605]}>
            <boxGeometry />
            <meshStandardMaterial color={DARK} roughness={1} />
          </mesh>
          <mesh geometry={box} position={[0, broodTop + 0.095, 0]} scale={[0.48, 0.18, 0.6]}>
            <meshStandardMaterial color={lighter} roughness={0.7} />
          </mesh>
        </>
      )}
      {/* Maniglie incassate sui fianchi. */}
      {[-1, 1].map((side) => (
        <mesh key={`hand${side}`} position={[side * 0.242, 0.16 + 0.2, 0]} scale={[0.004, 0.035, 0.16]}>
          <boxGeometry />
          <meshStandardMaterial color={DARK} roughness={1} />
        </mesh>
      ))}
      {/* Tetto sporgente: bordo in lamiera e copertura dipinta, che dall'alto è quel che si vede. */}
      <mesh geometry={box} position={[0, superTop + 0.03, 0]} scale={[0.56, 0.05, 0.68]}>
        <meshStandardMaterial color={ROOF} roughness={0.45} />
      </mesh>
      <mesh geometry={box} position={[0, superTop + 0.065, 0]} scale={[0.52, 0.03, 0.64]}>
        <meshStandardMaterial color={lighter} roughness={0.6} />
      </mesh>
      {brick && (
        <mesh position={[0.05, superTop + 0.11, -0.05]} rotation={[0, 0.4, 0]} scale={[0.16, 0.06, 0.08]}>
          <boxGeometry />
          <meshStandardMaterial color="#a4553a" roughness={0.95} />
        </mesh>
      )}
    </group>
  )
}

/** Api in volo: ognuna gira su un piccolo anello davanti alle arnie, con una fase sua. */
function Bees() {
  const mesh = useRef<InstancedMesh>(null)
  const flights = useMemo(
    () =>
      Array.from({ length: BEE_COUNT }, (_, i) => ({
        center: new Vector3((((i * 7) % HIVES.length) - (HIVES.length - 1) / 2) * SPACING, 0.45 + ((i * 13) % 7) * 0.05, 0.55 + ((i * 5) % 4) * 0.08),
        radius: 0.12 + ((i * 3) % 5) * 0.04,
        speed: 1.6 + ((i * 11) % 7) * 0.25,
        phase: i * 1.7,
      })),
    [],
  )
  const matrix = useMemo(() => new Matrix4(), [])
  const position = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const instanced = mesh.current
    if (!instanced) return
    const t = clock.elapsedTime
    flights.forEach((bee, i) => {
      const a = t * bee.speed + bee.phase
      position.set(bee.center.x + Math.cos(a) * bee.radius, bee.center.y + Math.sin(a * 2.3) * 0.05, bee.center.z + Math.sin(a) * bee.radius * 0.6)
      instanced.setMatrixAt(i, matrix.makeTranslation(position.x, position.y, position.z))
    })
    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BEE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.014, 6, 4]} />
      <meshStandardMaterial color="#d9a032" roughness={0.6} />
    </instancedMesh>
  )
}

export function Beehives() {
  const box = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.04), [])
  useEffect(() => () => box.dispose(), [box])
  return (
    <group>
      {HIVES.map((hive, i) => (
        <group key={hive.color} position={[(i - (HIVES.length - 1) / 2) * SPACING, 0, (i % 2) * 0.1]} rotation={[0, (i % 3) * 0.06 - 0.06, 0]}>
          <Hive color={hive.color} withSuper={hive.super} brick={hive.brick} box={box} />
        </group>
      ))}
      <Bees />
    </group>
  )
}
