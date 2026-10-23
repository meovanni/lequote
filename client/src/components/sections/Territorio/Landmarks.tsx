import { useMemo, type MutableRefObject } from 'react'
import type { Object3D } from 'three'
import type { TerrainData } from '@/lib/terrain/load'
import { worldAt } from './terrainGeometry'

export type PlaceId = 'roseto' | 'cerchio'

// I due luoghi come modellini: un casolare con il tetto in coppi a Roseto, tra gli ulivi, e una fila
// di arnie colorate a Cerchio. Fuori scala come tutto nei plastici, perché si vedano.
const HIVE_COLORS = ['#f4f1e8', '#9ec3d6', '#e9c65b', '#a9cfb4', '#e59a7d']

type LandmarksProps = { data: TerrainData; anchors: MutableRefObject<Record<PlaceId, Object3D | null>> }

export function Landmarks({ data, anchors }: LandmarksProps) {
  const roseto = useMemo(() => {
    const [u, v] = data.meta.places.roseto
    // Il casolare un poco all'interno: Roseto è proprio sulla riva.
    return worldAt(data, u - 0.012, v)
  }, [data])
  const cerchio = useMemo(() => worldAt(data, ...data.meta.places.cerchio), [data])

  return (
    <>
      <group position={roseto} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[1.3, 0.56, 0.8]} />
          <meshStandardMaterial color="#f1e9da" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.08, 1, 0.66]}>
          <coneGeometry args={[0.98, 0.46, 4]} />
          <meshStandardMaterial color="#c0663f" roughness={0.85} flatShading />
        </mesh>
        <object3D ref={(object) => void (anchors.current.roseto = object)} position={[0, 1.6, 0]} />
      </group>

      <group position={cerchio} rotation={[0, -0.3, 0]}>
        {HIVE_COLORS.map((color, i) => (
          <group key={color} position={[(i - 2) * 0.5, 0, (i % 2) * 0.12]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.32, 0.4, 0.36]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.43, 0]}>
              <boxGeometry args={[0.38, 0.06, 0.42]} />
              <meshStandardMaterial color="#d9d4ca" roughness={0.8} />
            </mesh>
          </group>
        ))}
        <object3D ref={(object) => void (anchors.current.cerchio = object)} position={[0, 1.4, 0]} />
      </group>
    </>
  )
}
