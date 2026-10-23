import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { MeshStandardMaterial, type BufferGeometry } from 'three'

// Onde piccole: due sinusoidi incrociate spostano la superficie in verticale e ne inclinano la
// normale, così la luce le fa luccicare. Ampiezze e lunghezze in km del mondo (1 unità = 1 km).
const WAVES_GLSL = /* glsl */ `
  uniform float uTime;
  float waveA(vec3 p) { return p.x * 0.9 + p.z * 0.25 + uTime * 1.1; }
  float waveB(vec3 p) { return p.z * 0.55 - p.x * 0.35 - uTime * 0.7; }
`

function makeSeaMaterial() {
  const uniforms = { uTime: { value: 0 } }
  const material = new MeshStandardMaterial({ color: '#6f98a5', roughness: 0.32, metalness: 0 })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WAVES_GLSL}`)
      .replace(
        '#include <beginnormal_vertex>',
        `float a = waveA(position);
         float b = waveB(position);
         float dx = 0.9 * 0.05 * cos(a) - 0.35 * 0.04 * cos(b);
         float dz = 0.25 * 0.05 * cos(a) + 0.55 * 0.04 * cos(b);
         vec3 objectNormal = normalize(vec3(-dx, 1.0, -dz));`,
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position);\ntransformed.y += 0.05 * sin(a) + 0.04 * sin(b);')
  }
  return { material, uniforms }
}

export function Sea({ geometry }: { geometry: BufferGeometry }) {
  const { material, uniforms } = useMemo(makeSeaMaterial, [])
  useEffect(() => () => material.dispose(), [material])
  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.1)
  })
  return <mesh geometry={geometry} material={material} receiveShadow />
}
