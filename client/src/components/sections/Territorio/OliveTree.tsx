import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { DoubleSide, InstancedMesh, MeshStandardMaterial } from 'three'
import { buildOlive, leafGeometry } from './oliveGeometry'

// Le foglie tremano sulla scheda grafica: ognuna ruota appena attorno al proprio asse, con una
// fase presa dalla sua posizione, e a raffiche lente si piega tutta la chioma.
const FLUTTER_GLSL = /* glsl */ `
  uniform float uTime;
`
const FLUTTER_VERTEX = /* glsl */ `
  vec3 transformed = vec3(position);
  float phase = dot(instanceMatrix[3].xyz, vec3(41.3, 17.9, 29.7));
  float gust = 0.65 + 0.35 * sin(uTime * 0.5 + instanceMatrix[3].x * 3.0);
  float flutter = sin(uTime * 7.0 + phase) * 0.55 * gust;
  float c = cos(flutter);
  float s = sin(flutter);
  transformed.yz = vec2(transformed.y * c - transformed.z * s, transformed.y * s + transformed.z * c);
  transformed.y += sin(uTime * 1.3 + phase) * 0.004 * gust;
`

function makeLeafMaterial() {
  const uniforms = { uTime: { value: 0 } }
  const material = new MeshStandardMaterial({ side: DoubleSide, roughness: 0.75, metalness: 0 })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${FLUTTER_GLSL}`).replace('#include <begin_vertex>', FLUTTER_VERTEX)
  }
  return { material, uniforms }
}

export function OliveTree() {
  const model = useMemo(() => buildOlive(), [])
  const leaf = useMemo(leafGeometry, [])
  const { material, uniforms } = useMemo(makeLeafMaterial, [])
  const leaves = useRef<InstancedMesh>(null)
  const fruits = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = leaves.current
    if (!mesh) return
    model.leaves.forEach((matrix, i) => {
      mesh.setMatrixAt(i, matrix)
      mesh.setColorAt(i, model.leafColors[i])
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    const olives = fruits.current
    if (!olives) return
    model.fruits.forEach((position, i) => {
      olives.setMatrixAt(i, olives.matrix.clone().makeTranslation(position.x, position.y, position.z))
    })
    olives.instanceMatrix.needsUpdate = true
  }, [model])

  useEffect(
    () => () => {
      model.wood.dispose()
      leaf.dispose()
      material.dispose()
    },
    [model, leaf, material],
  )

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.1)
  })

  return (
    <group>
      <mesh geometry={model.wood}>
        <meshStandardMaterial vertexColors roughness={0.95} />
      </mesh>
      <instancedMesh ref={leaves} args={[leaf, material, model.leaves.length]} frustumCulled={false} />
      <instancedMesh ref={fruits} args={[undefined, undefined, model.fruits.length]} frustumCulled={false}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshStandardMaterial color="#3b2f3a" roughness={0.4} />
      </instancedMesh>
    </group>
  )
}
