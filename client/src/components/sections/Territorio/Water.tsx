import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { DataTexture, MeshPhysicalMaterial, PMREMGenerator, RepeatWrapping, RGBAFormat, Vector2, type Texture } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { TerrainData } from '@/lib/terrain/load'

// Velo d'acqua sopra l'Adriatico cotto nella texture: trasparente, con due trame di increspature
// che scorrono in direzioni diverse (normalMap e clearcoatNormalMap), così il sole e un riflesso
// morbido di cielo ci accendono piccoli lampi che si muovono. La maschera (alphaMap) lo limita al
// mare e lo sfuma al largo come il resto del diorama.
const RIPPLE_SIZE = 256
const RIPPLE_REPEAT = 70

/** Mappa di normali che si ripete senza giunture: somma di onde con frequenze intere. */
function rippleNormals(seed: number) {
  const size = RIPPLE_SIZE
  const height = new Float32Array(size * size)
  // Molte onde in direzioni sparse: increspature irregolari, niente righe.
  const random = (k: number) => {
    const a = Math.sin(seed * 12.9 + k * 78.2) * 43758.5
    return a - Math.floor(a)
  }
  const waves = Array.from({ length: 14 }, (_, i) => {
    const angle = random(i) * Math.PI * 2
    const frequency = 2 + Math.floor(random(i + 40) * 9)
    return { fx: Math.round(Math.cos(angle) * frequency), fy: Math.round(Math.sin(angle) * frequency), phase: random(i + 80) * Math.PI * 2, amp: 1 / (1 + frequency * 0.25) }
  })
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2
      const v = (y / size) * Math.PI * 2
      height[y * size + x] = waves.reduce((sum, w) => sum + w.amp * Math.sin(w.fx * u + w.fy * v + w.phase), 0)
    }
  }
  const data = new Uint8Array(size * size * 4)
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 0.9
      const dy = (at(x, y + 1) - at(x, y - 1)) * 0.9
      const length = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      data[i] = ((-dx / length) * 0.5 + 0.5) * 255
      data[i + 1] = ((-dy / length) * 0.5 + 0.5) * 255
      data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255
      data[i + 3] = 255
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(RIPPLE_REPEAT, RIPPLE_REPEAT)
  texture.needsUpdate = true
  return texture
}

export function Water({ data, alphaMap }: { data: TerrainData; alphaMap: Texture }) {
  const { gl } = useThree()
  const { material, ripples } = useMemo(() => {
    const ripples = [rippleNormals(1), rippleNormals(4)]
    ripples[1].repeat.set(RIPPLE_REPEAT * 1.37, RIPPLE_REPEAT * 1.37)
    const pmrem = new PMREMGenerator(gl)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    const material = new MeshPhysicalMaterial({
      color: '#a6e6de',
      roughness: 0.12,
      metalness: 0,
      transparent: true,
      opacity: 0.32,
      alphaMap,
      depthWrite: false,
      normalMap: ripples[0],
      normalScale: new Vector2(0.55, 0.55),
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      clearcoatNormalMap: ripples[1],
      clearcoatNormalScale: new Vector2(0.4, 0.4),
      envMap: environment,
      envMapIntensity: 0.45,
    })
    return { material, ripples }
  }, [gl, alphaMap])

  useEffect(
    () => () => {
      material.envMap?.dispose()
      ripples.forEach((texture) => texture.dispose())
      material.dispose()
    },
    [material, ripples],
  )

  // Le due trame scorrono piano in direzioni diverse: le increspature cambiano senza ripetersi.
  useFrame((_, delta) => {
    const step = Math.min(delta, 0.1)
    ripples[0].offset.x += step * 0.012
    ripples[0].offset.y += step * 0.006
    ripples[1].offset.x -= step * 0.007
    ripples[1].offset.y += step * 0.011
  })

  const { widthKm, heightKm } = data.meta
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} material={material}>
      <planeGeometry args={[widthKm, heightKm]} />
    </mesh>
  )
}
