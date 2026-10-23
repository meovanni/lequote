import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import { CatmullRomCurve3, Group, Vector3, type Object3D } from 'three'
import type { TerrainData } from '@/lib/terrain/load'
import { worldAt } from './terrainGeometry'

export type PlaceId = 'roseto' | 'cerchio'

// I due luoghi come modellini, fuori scala come tutto nei plastici perché si vedano anche da
// lontano: a Roseto un grande olivo accanto al casolare, a Cerchio una fila di arnie colorate.
const HIVE_COLORS = ['#f4f1e8', '#9ec3d6', '#e9c65b', '#a9cfb4', '#e59a7d']
const OLIVE_SCALE = 6
const HOUSE_SCALE = 2.6
const HIVE_SCALE = 5.5
const BARK = '#7a6a58'

// Olivo in unità "albero" (alto circa 1): tronco contorto e chioma a ciuffi grigio-verdi.
const TRUNK = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0.06, 0.18, 0.02), new Vector3(-0.05, 0.36, -0.02), new Vector3(0.02, 0.52, 0)])
const BRANCHES = [
  new CatmullRomCurve3([new Vector3(0.01, 0.44, 0), new Vector3(0.16, 0.56, 0.05), new Vector3(0.27, 0.7, 0.08)]),
  new CatmullRomCurve3([new Vector3(-0.01, 0.42, 0), new Vector3(-0.15, 0.55, -0.04), new Vector3(-0.25, 0.68, -0.05)]),
]
const CROWN: { position: [number, number, number]; size: [number, number, number]; color: string }[] = [
  { position: [0, 0.78, 0], size: [0.34, 0.24, 0.32], color: '#8f9c74' },
  { position: [0.26, 0.72, 0.08], size: [0.24, 0.18, 0.24], color: '#a2ad88' },
  { position: [-0.24, 0.7, -0.06], size: [0.25, 0.18, 0.24], color: '#86946c' },
  { position: [0.06, 0.9, -0.12], size: [0.22, 0.16, 0.2], color: '#a7b18e' },
  { position: [-0.08, 0.66, 0.18], size: [0.2, 0.15, 0.2], color: '#7f8d65' },
]

function OliveTree() {
  const crown = useRef<Group>(null)
  // La chioma ondeggia appena, come mossa dalla brezza di mare.
  useFrame(({ clock }) => {
    if (crown.current) crown.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.025
  })
  return (
    <group>
      <mesh>
        <tubeGeometry args={[TRUNK, 20, 0.05, 8, false]} />
        <meshStandardMaterial color={BARK} roughness={0.95} />
      </mesh>
      {BRANCHES.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 12, 0.024, 6, false]} />
          <meshStandardMaterial color={BARK} roughness={0.95} />
        </mesh>
      ))}
      <group ref={crown} position={[0, 0.45, 0]}>
        {CROWN.map(({ position, size, color }, i) => (
          <mesh key={i} position={[position[0], position[1] - 0.45, position[2]]} scale={size}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={color} roughness={1} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

type LandmarksProps = { data: TerrainData; anchors: MutableRefObject<Record<PlaceId, Object3D | null>> }

export function Landmarks({ data, anchors }: LandmarksProps) {
  // Roseto è sulla riva: casolare e olivo un poco all'interno.
  const roseto = useMemo(() => worldAt(data, data.meta.places.roseto[0] - 0.016, data.meta.places.roseto[1]), [data])
  const cerchio = useMemo(() => worldAt(data, ...data.meta.places.cerchio), [data])

  return (
    <>
      <group position={roseto} rotation={[0, 0.5, 0]}>
        <group scale={HOUSE_SCALE} position={[1.8, 0, 0.8]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[1.3, 0.56, 0.8]} />
            <meshStandardMaterial color="#f1e9da" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.08, 1, 0.66]}>
            <coneGeometry args={[0.98, 0.46, 4]} />
            <meshStandardMaterial color="#c0663f" roughness={0.85} flatShading />
          </mesh>
        </group>
        <group scale={OLIVE_SCALE} position={[-2.2, 0, -1]}>
          <OliveTree />
        </group>
        <object3D ref={(object) => void (anchors.current.roseto = object)} position={[0, 6.5, 0]} />
      </group>

      <group position={cerchio} rotation={[0, -0.3, 0]}>
        <group scale={HIVE_SCALE}>
          {HIVE_COLORS.map((color, i) => (
            <group key={color} position={[(i - 2) * 0.5, 0, (i % 2) * 0.12]}>
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.32, 0.4, 0.36]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
              {/* Coperchio dello stesso colore: dall'alto si vede soprattutto quello. */}
              <mesh position={[0, 0.43, 0]}>
                <boxGeometry args={[0.38, 0.06, 0.42]} />
                <meshStandardMaterial color={color} roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
        <object3D ref={(object) => void (anchors.current.cerchio = object)} position={[0, 4.2, 0]} />
      </group>
    </>
  )
}
