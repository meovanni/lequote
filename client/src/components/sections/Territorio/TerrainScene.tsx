import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Noise, TiltShift2, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Color, PerspectiveCamera, SRGBColorSpace, TextureLoader, Vector3, type Object3D, type Texture } from 'three'
import { damp, dollyForAspect, exitShift, fovForAspect, poseAt } from '@/lib/terrain/flight'
import { loadTerrain, type TerrainData } from '@/lib/terrain/load'
import { Landmarks, type PlaceId } from './Landmarks'
import { Mist } from './Mist'
import { buildTerrainGeometry } from './terrainGeometry'
import { Trees } from './Trees'
import { Water } from './Water'

export type { PlaceId }
const PLACE_IDS: PlaceId[] = ['roseto', 'cerchio']
const LABEL_MARGIN = 12
/** Sul telefono la camera si allontana poco più che sul desktop: di più il diorama diventa piccolo. */
const MAX_PHONE_DOLLY = 1.3
/** Sul desktop il soggetto si sposta a destra, lontano dai testi a sinistra (frazione della larghezza). */
const DESKTOP_SHIFT = 0.12

type TerrainSceneProps = {
  /** Progress voluto (0-1): la camera lo raggiunge con uno smorzamento. */
  progress: MutableRefObject<number>
  /** Etichette HTML dei due luoghi, spostate sopra i modellini a ogni frame. */
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
  /** Fuori dallo schermo la scena non disegna. */
  active: boolean
  /** Telefono: meno vertici, meno alberi, niente multisampling. */
  lite: boolean
  onReady?: () => void
  onError?: () => void
}

type Assets = { data: TerrainData; color: Texture; sea: Texture }

function loadTexture(url: string, srgb: boolean): Promise<Texture> {
  return new TextureLoader().loadAsync(url).then((texture) => {
    if (srgb) texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    return texture
  })
}

/** Colore del fondo dai token della pagina: il diorama sfuma nello stesso bianco della sezione. */
function floorColor() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--color-bianco').trim()
  return new Color(value || '#fcfcfb')
}

export function TerrainScene({ progress, labels, active, lite, onReady, onError }: TerrainSceneProps) {
  const [assets, setAssets] = useState<Assets | null>(null)
  const floor = useMemo(floorColor, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([loadTerrain(), loadTexture('/terrain/abruzzo-color.jpg', true), loadTexture('/terrain/abruzzo-sea.png', false)])
      .then(([data, color, sea]) => {
        if (!cancelled) setAssets({ data, color, sea })
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
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 32, near: 2, far: 1600, position: poseAt(0).position }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.domElement.setAttribute('aria-hidden', 'true')}
    >
      <color attach="background" args={[floor]} />
      <fog attach="fog" args={[floor, 240, 640]} />
      {assets && <Diorama assets={assets} floor={floor} lite={lite} progress={progress} labels={labels} onReady={onReady} />}
      <EffectComposer multisampling={lite ? 0 : 4} enableNormalPass={false}>
        <TiltShift2 blur={lite ? 0.1 : 0.14} taper={0.55} start={[0, 0.52]} end={[1, 0.52]} samples={lite ? 6 : 10} />
        <Vignette offset={0.38} darkness={0.22} />
        <Noise opacity={0.025} premultiply />
      </EffectComposer>
    </Canvas>
  )
}

type DioramaProps = {
  assets: Assets
  floor: Color
  lite: boolean
  progress: MutableRefObject<number>
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
  onReady?: () => void
}

function Diorama({ assets, floor, lite, progress, labels, onReady }: DioramaProps) {
  const { data, color, sea } = assets
  const terrain = useMemo(() => buildTerrainGeometry(data, lite ? 300 : 520), [data, lite])
  const anchors = useRef<Record<PlaceId, Object3D | null>>({ roseto: null, cerchio: null })
  const sun = useMemo(() => new Vector3(...data.meta.sun).multiplyScalar(300), [data])

  useEffect(() => onReady?.(), [onReady])
  useEffect(() => () => terrain.dispose(), [terrain])

  return (
    <>
      <hemisphereLight args={['#ffffff', '#d8d1c2', 1.15]} />
      <directionalLight position={sun} intensity={1.5} color="#fff4e2" />
      {/* Il tavolo: lo stesso bianco del fondo, fino all'orizzonte. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <meshBasicMaterial color={floor} />
      </mesh>
      <mesh geometry={terrain}>
        <meshBasicMaterial map={color} />
      </mesh>
      <Water data={data} alphaMap={sea} />
      <Trees data={data} density={lite ? 0.5 : 1} />
      <Landmarks data={data} anchors={anchors} />
      <Mist opacity={lite ? 0.16 : 0.22} />
      <CameraRig progress={progress} anchors={anchors} labels={labels} />
    </>
  )
}

type CameraRigProps = {
  progress: MutableRefObject<number>
  anchors: MutableRefObject<Record<PlaceId, Object3D | null>>
  labels: MutableRefObject<Record<PlaceId, HTMLElement | null>>
}

/** Porta la camera lungo l'arco, poi la fa scorrere con la pagina; tiene le etichette sopra i modellini. */
function CameraRig({ progress, anchors, labels }: CameraRigProps) {
  const { camera, size } = useThree()
  const current = useRef(progress.current)
  const projected = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const aspect = size.width / Math.max(1, size.height)
    camera.fov = fovForAspect(aspect)
    if (aspect > 1.2) camera.setViewOffset(size.width, size.height, -DESKTOP_SHIFT * size.width, 0, size.width, size.height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }, [camera, size])

  useFrame((_, delta) => {
    // Smorzamento lento: la camera ha il peso di un carrello, non segue lo scroll a scatti.
    current.current = damp(current.current, progress.current, 2.6, Math.min(delta, 0.1))
    const dolly = Math.min(MAX_PHONE_DOLLY, dollyForAspect(size.width / Math.max(1, size.height)))
    const pose = poseAt(current.current, dolly)
    // L'uscita segue lo scroll senza smorzamento: deve andare alla stessa velocità della pagina.
    const shift = exitShift(pose, camera instanceof PerspectiveCamera ? camera.fov : 32, progress.current)
    camera.position.set(pose.position[0] + shift[0], pose.position[1] + shift[1], pose.position[2] + shift[2])
    camera.lookAt(pose.target[0] + shift[0], pose.target[1] + shift[1], pose.target[2] + shift[2])
    camera.updateMatrixWorld()

    PLACE_IDS.forEach((id) => {
      const label = labels.current[id]
      const anchor = anchors.current[id]
      if (!label || !anchor) return
      anchor.getWorldPosition(projected).project(camera)
      // Fuori dallo schermo l'etichetta sparisce; vicino al bordo resta tutta dentro.
      const onScreen = projected.z < 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1
      const half = label.offsetWidth / 2 + LABEL_MARGIN
      const x = Math.min(size.width - half, Math.max(half, ((projected.x + 1) / 2) * size.width))
      const y = ((1 - projected.y) / 2) * size.height
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      label.style.visibility = onScreen ? 'visible' : 'hidden'
    })
  })

  return null
}
