import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial, type Texture } from 'three'
import type { TerrainData } from '@/lib/terrain/load'

// Velo d'acqua sopra l'Adriatico cotto nella texture: trasparente, con piccole onde che ne
// inclinano la normale, così il sole ci fa dei riflessi che si muovono. La maschera (alphaMap)
// lo limita al mare e lo sfuma al largo, come il resto del diorama.
const WAVES_GLSL = /* glsl */ `
  uniform float uTime;
  float waveA(vec3 p) { return p.x * 1.6 + p.z * 0.4 + uTime * 0.9; }
  float waveB(vec3 p) { return p.z * 1.1 - p.x * 0.7 - uTime * 0.6; }
`

function makeWaterMaterial(alphaMap: Texture) {
  const uniforms = { uTime: { value: 0 } }
  const material = new MeshStandardMaterial({ color: '#cfe4e6', roughness: 0.18, metalness: 0, transparent: true, opacity: 0.55, alphaMap, depthWrite: false })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WAVES_GLSL}`)
      .replace(
        '#include <beginnormal_vertex>',
        `float a = waveA(position);
         float b = waveB(position);
         float dx = 1.6 * 0.03 * cos(a) - 0.7 * 0.025 * cos(b);
         float dz = 0.4 * 0.03 * cos(a) + 1.1 * 0.025 * cos(b);
         vec3 objectNormal = normalize(vec3(-dx * 6.0, 1.0, -dz * 6.0));`,
      )
  }
  return { material, uniforms }
}

export function Water({ data, alphaMap }: { data: TerrainData; alphaMap: Texture }) {
  const { material, uniforms } = useMemo(() => makeWaterMaterial(alphaMap), [alphaMap])
  useEffect(() => () => material.dispose(), [material])
  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.1)
  })
  const { widthKm, heightKm } = data.meta
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} material={material}>
      <planeGeometry args={[widthKm, heightKm, 220, 200]} />
    </mesh>
  )
}
