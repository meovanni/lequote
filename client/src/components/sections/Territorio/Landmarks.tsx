import { useMemo, type MutableRefObject } from 'react'
import type { Object3D } from 'three'
import type { TerrainData } from '@/lib/terrain/load'
import { Beehives } from './Beehives'
import { OliveTree } from './OliveTree'
import { worldAt } from './terrainGeometry'

export type PlaceId = 'roseto' | 'cerchio'

// I due luoghi come modellini, fuori scala come tutto nei plastici perché si vedano anche da
// lontano: a Roseto un grande olivo accanto al casolare, a Cerchio una fila di arnie colorate.
const OLIVE_SCALE = 6
const HOUSE_SCALE = 2.6
const HIVE_SCALE = 3.6

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
          <Beehives />
        </group>
        <object3D ref={(object) => void (anchors.current.cerchio = object)} position={[0, 4.2, 0]} />
      </group>
    </>
  )
}
