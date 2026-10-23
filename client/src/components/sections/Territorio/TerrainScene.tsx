import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { DirectionalLight, DoubleSide, Group, PerspectiveCamera, Vector3, type Object3D } from 'three'
import { heightToWorld, uvToWorld } from '@/lib/terrain/geo'
import { loadTerrain, type TerrainData } from '@/lib/terrain/load'
import { cameraPosition, damp, fitDistance, yawAt } from '@/lib/terrain/view'
import { Bee } from './Bee'
import { OliveTree } from './OliveTree'
import { Sea } from './Sea'
import { BASE_Y, buildLandGeometry, buildSeaGeometry, buildWallGeometry, describeModel, metersAt, seaEdge, SEA_LEVEL, type Model } from './terrainGeometry'

export type PlaceId = 'roseto' | 'cerchio'
const PLACE_IDS: PlaceId[] = ['roseto', 'cerchio']
const LABEL_MARGIN = 12
const FOV = 30
/** Segnaposto fuori scala, come le bandierine di un plastico: altrimenti sarebbero invisibili. */
const TREE_SCALE = 15
/** Roseto è sulla riva: l'olivo un poco all'interno, così la chioma non finisce in mare. */
const TREE_INLAND_KM = 2.5
const BEE_SCALE = 7
const BEE_HOVER = 7
const WALL_COLOR = '#e7e0d2'
const SEA_WALL_COLOR = '#4f7380'

/** Spazio lasciato ai testi (frazioni dello schermo): a sinistra sul desktop, sopra e sotto sul telefono. */
type Layout = { textLeft: number; textTop: number; textBottom: number }

type TerrainSceneProps = {
  /** Progress voluto (0-1): la rotazione lo raggiunge con uno smorzamento. */
  progress: MutableRefObject<number>
  /** Etichette HTML dei due luoghi, spostate sopra i segnaposto a ogni frame. */
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
  /** Fuori dallo schermo la scena non disegna. */
  active: boolean
  /** Più basso su telefono: meno vertici e ombre più leggere. */
  segments: number
  onReady?: () => void
  onError?: () => void
}

export function TerrainScene({ progress, labels, active, segments, onReady, onError }: TerrainSceneProps) {
  const [data, setData] = useState<TerrainData | null>(null)

  useEffect(() => {
    let cancelled = false
    loadTerrain()
      .then((loaded) => {
        if (!cancelled) setData(loaded)
      })
      .catch(() => {
        if (!cancelled) onError?.()
      })
    return () => {
      cancelled = true
    }
  }, [onError])

  return (
    <Canvas
      flat
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: FOV, near: 1, far: 2000, position: [0, 200, 200] }}
      gl={{ antialias: true, powerPreference: 'low-power', alpha: true }}
      onCreated={({ gl }) => gl.domElement.setAttribute('aria-hidden', 'true')}
    >
      <hemisphereLight args={['#ffffff', '#d9d4c8', 1.25]} />
      {data && <Diorama data={data} segments={segments} progress={progress} labels={labels} onReady={onReady} />}
    </Canvas>
  )
}

type DioramaProps = {
  data: TerrainData
  segments: number
  progress: MutableRefObject<number>
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
  onReady?: () => void
}

function Diorama({ data, segments, progress, labels, onReady }: DioramaProps) {
  const model = useMemo(() => describeModel(data), [data])
  const land = useMemo(() => buildLandGeometry(data, model, segments), [data, model, segments])
  const landWall = useMemo(() => buildWallGeometry(model.outline, (point) => heightToWorld(metersAt(data, point)), true), [data, model])
  const sea = useMemo(() => buildSeaGeometry(model, 220, 30), [model])
  const seaWall = useMemo(() => buildWallGeometry(seaEdge(model), () => SEA_LEVEL, false), [model])
  const turntable = useRef<Group>(null)
  const anchors = useRef<Record<PlaceId, Object3D | null>>({ roseto: null, cerchio: null })
  const places = useMemo(() => placePositions(data), [data])

  useEffect(() => onReady?.(), [onReady])
  useEffect(
    () => () => {
      ;[land, landWall, sea, seaWall].forEach((geometry) => geometry.dispose())
    },
    [land, landWall, sea, seaWall],
  )

  return (
    <>
      <Sun model={model} shadowSize={segments > 300 ? 2048 : 1024} />
      <Framing model={model} progress={progress} turntable={turntable} anchors={anchors} labels={labels} />
      <group ref={turntable}>
        <group position={[-model.center[0], 0, -model.center[2]]}>
          <mesh geometry={land} castShadow receiveShadow>
            <meshStandardMaterial vertexColors roughness={0.92} />
          </mesh>
          <mesh geometry={landWall} castShadow receiveShadow>
            <meshStandardMaterial color={WALL_COLOR} roughness={1} side={DoubleSide} />
          </mesh>
          <Sea geometry={sea} />
          <mesh geometry={seaWall} receiveShadow>
            <meshStandardMaterial color={SEA_WALL_COLOR} roughness={0.6} side={DoubleSide} />
          </mesh>
          <group position={[places.roseto.x - TREE_INLAND_KM, places.roseto.y, places.roseto.z]}>
            <OliveTree scale={TREE_SCALE} anchor={(object) => (anchors.current.roseto = object)} />
          </group>
          <group position={[places.cerchio.x, places.cerchio.y + BEE_HOVER, places.cerchio.z]}>
            <Bee scale={BEE_SCALE} anchor={(object) => (anchors.current.cerchio = object)} />
          </group>
        </group>
      </group>
      {/* Il tavolo: invisibile, raccoglie solo l'ombra del plastico. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y - 0.01, 0]} receiveShadow>
        <planeGeometry args={[1200, 1200]} />
        <shadowMaterial opacity={0.14} />
      </mesh>
    </>
  )
}

function placePositions(data: TerrainData): Record<PlaceId, Vector3> {
  const at = (id: PlaceId) => {
    const [u, v] = data.meta.places[id]
    const [x, z] = uvToWorld(u, v, data.meta)
    return new Vector3(x, heightToWorld(metersAt(data, [x, z])), z)
  }
  return { roseto: at('roseto'), cerchio: at('cerchio') }
}

/** Sole da sud-ovest: rilievi in risalto e ombra del plastico sul tavolo, verso nord-est. */
function Sun({ model, shadowSize }: { model: Model; shadowSize: number }) {
  const light = useRef<DirectionalLight>(null)
  useEffect(() => {
    const current = light.current
    if (!current) return
    const extent = model.radius * 1.15
    Object.assign(current.shadow.camera, { left: -extent, right: extent, top: extent, bottom: -extent, near: 1, far: 800 })
    current.shadow.camera.updateProjectionMatrix()
  }, [model])
  return (
    <directionalLight
      ref={light}
      position={[-160, 240, 140]}
      intensity={1.7}
      castShadow
      shadow-mapSize={[shadowSize, shadowSize]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.6}
    />
  )
}

function layoutFor(width: number, height: number): Layout {
  return width / height > 1.2 ? { textLeft: 0.34, textTop: 0, textBottom: 0 } : { textLeft: 0, textTop: 0.2, textBottom: 0.26 }
}

type FramingProps = {
  model: Model
  progress: MutableRefObject<number>
  turntable: MutableRefObject<Group | null>
  anchors: MutableRefObject<Record<PlaceId, Object3D | null>>
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
}

/** Camera ferma a 45° da sud, plastico intero nello spazio libero dai testi; rotazione ed etichette. */
function Framing({ model, progress, turntable, anchors, labels }: FramingProps) {
  const { camera, size } = useThree()
  const current = useRef(progress.current)
  const world = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const layout = layoutFor(size.width, size.height)
    const freeWidth = size.width * (1 - layout.textLeft)
    const freeHeight = size.height * (1 - layout.textTop - layout.textBottom)
    const distance = fitDistance(model.radius, FOV * (freeHeight / size.height), freeWidth / freeHeight)
    camera.position.set(...cameraPosition(distance, [0, model.center[1], 0]))
    camera.lookAt(0, model.center[1], 0)
    // Sposta l'inquadratura nello spazio libero: a destra dei testi, o tra titolo e schede.
    const shiftX = (-layout.textLeft * size.width) / 2
    const shiftY = ((layout.textBottom - layout.textTop) * size.height) / 2
    camera.setViewOffset(size.width, size.height, shiftX, shiftY, size.width, size.height)
    camera.updateProjectionMatrix()
  }, [camera, size, model])

  useFrame((_, delta) => {
    current.current = damp(current.current, progress.current, 4, Math.min(delta, 0.1))
    if (turntable.current) turntable.current.rotation.y = yawAt(current.current)

    PLACE_IDS.forEach((id) => {
      const label = labels.current[id]
      const anchor = anchors.current[id]
      if (!label || !anchor) return
      anchor.getWorldPosition(world).project(camera)
      const half = label.offsetWidth / 2 + LABEL_MARGIN
      const x = Math.min(size.width - half, Math.max(half, ((world.x + 1) / 2) * size.width))
      const y = ((1 - world.y) / 2) * size.height
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      label.style.visibility = world.z < 1 ? 'visible' : 'hidden'
    })
  })

  return null
}
