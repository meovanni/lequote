import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Color, Line, LineBasicMaterial, PerspectiveCamera, Vector3 } from 'three'
import { KEYFRAMES, damp, dollyForAspect, fovForAspect, poseAt } from '@/lib/terrain/flight'
import { uvToWorld } from '@/lib/terrain/geo'
import { loadTerrain, type TerrainData } from '@/lib/terrain/load'
import { buildOutlineGeometry, buildTerrainGeometry, terrainHeightAt, type TerrainPalette } from './terrainGeometry'

export type PlaceId = 'roseto' | 'cerchio'
const PLACE_IDS: PlaceId[] = ['roseto', 'cerchio']
const PIN_HEIGHT = 2
const LABEL_MARGIN = 12

type TerrainSceneProps = {
  /** Progress voluto (0-1): la camera lo raggiunge con uno smorzamento. */
  progress: MutableRefObject<number>
  /** Etichette HTML dei due luoghi, spostate sopra gli spilli a ogni frame. */
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
  /** Fuori dallo schermo la scena non disegna. */
  active: boolean
  /** Più basso su telefono: meno vertici. */
  segments: number
  onReady?: () => void
  onError?: () => void
}

/** Colori dai token della pagina (tokens.css), così il plastico segue la palette. */
function readPalette(): { palette: TerrainPalette; ink: Color } {
  const style = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => new Color(style.getPropertyValue(name).trim() || fallback)
  const background = token('--color-bianco', '#fcfcfb')
  return {
    palette: {
      background,
      region: background.clone().lerp(new Color('#ffffff'), 0.4),
      outside: token('--color-linea', '#e3e3df'),
      // Il mare è piatto e in ombra rispetto ai pendii: col colore dello sfondo resta chiaro, la costa la segna il contorno.
      sea: background,
    },
    ink: token('--color-inchiostro', '#233142'),
  }
}

export function TerrainScene({ progress, labels, active, segments, onReady, onError }: TerrainSceneProps) {
  const [data, setData] = useState<TerrainData | null>(null)
  const colors = useMemo(readPalette, [])

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
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 34, near: 0.5, far: 400, position: poseAt(0).position }}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      aria-hidden="true"
      onCreated={({ gl }) => gl.domElement.setAttribute('aria-hidden', 'true')}
    >
      <color attach="background" args={[colors.palette.background]} />
      <fog attach="fog" args={[colors.palette.background, 90, 260]} />
      <hemisphereLight args={['#ffffff', '#cfd3d8', 1.5]} />
      <directionalLight position={[-60, 70, -40]} intensity={1.6} />
      {data && <Terrain data={data} colors={colors} segments={segments} onReady={onReady} />}
      {data && <CameraRig data={data} progress={progress} labels={labels} />}
    </Canvas>
  )
}

function Terrain({
  data,
  colors,
  segments,
  onReady,
}: {
  data: TerrainData
  colors: ReturnType<typeof readPalette>
  segments: number
  onReady?: () => void
}) {
  const terrain = useMemo(() => buildTerrainGeometry(data, colors.palette, segments), [data, colors, segments])
  const outline = useMemo(
    () => new Line(buildOutlineGeometry(data), new LineBasicMaterial({ color: colors.ink, transparent: true, opacity: 0.5 })),
    [data, colors],
  )
  const pins = useMemo(() => PLACE_IDS.map((id) => pinBase(data, id)), [data])

  useEffect(() => onReady?.(), [onReady])
  useEffect(
    () => () => {
      terrain.dispose()
      outline.geometry.dispose()
      ;(outline.material as LineBasicMaterial).dispose()
    },
    [terrain, outline],
  )

  return (
    <>
      <mesh geometry={terrain}>
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
      </mesh>
      <primitive object={outline} />
      {pins.map((base, index) => (
        <group key={PLACE_IDS[index]} position={base}>
          <mesh position={[0, PIN_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, PIN_HEIGHT, 8]} />
            <meshBasicMaterial color={colors.ink} />
          </mesh>
          <mesh position={[0, PIN_HEIGHT, 0]}>
            <sphereGeometry args={[0.3, 20, 14]} />
            <meshBasicMaterial color={colors.ink} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function pinBase(data: TerrainData, id: PlaceId): Vector3 {
  const [u, v] = data.meta.places[id]
  const [x, z] = uvToWorld(u, v, data.meta)
  return new Vector3(x, terrainHeightAt(data, u, v), z)
}

/** Porta la camera lungo il volo e tiene le etichette sopra gli spilli. */
function CameraRig({
  data,
  progress,
  labels,
}: {
  data: TerrainData
  progress: MutableRefObject<number>
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
}) {
  const { camera, size } = useThree()
  const current = useRef(progress.current)
  const tops = useMemo(() => PLACE_IDS.map((id) => pinBase(data, id).add(new Vector3(0, PIN_HEIGHT, 0))), [data])
  const projected = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    camera.fov = fovForAspect(size.width / Math.max(1, size.height))
    camera.updateProjectionMatrix()
  }, [camera, size])

  useFrame((_, delta) => {
    current.current = damp(current.current, progress.current, 4.5, Math.min(delta, 0.1))
    const pose = poseAt(current.current, KEYFRAMES, dollyForAspect(size.width / Math.max(1, size.height)))
    camera.position.set(...pose.position)
    camera.lookAt(...pose.target)
    camera.updateMatrixWorld()

    PLACE_IDS.forEach((id, index) => {
      const label = labels.current[id]
      if (!label) return
      projected.copy(tops[index]).project(camera)
      const inFront = projected.z < 1
      // L'etichetta resta dentro lo schermo anche quando lo spillo è vicino al bordo.
      const half = label.offsetWidth / 2 + LABEL_MARGIN
      const x = Math.min(size.width - half, Math.max(half, ((projected.x + 1) / 2) * size.width))
      const y = ((1 - projected.y) / 2) * size.height
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      label.style.visibility = inFront ? 'visible' : 'hidden'
    })
  })

  return null
}
