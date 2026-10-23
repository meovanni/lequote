import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import type { TerrainData } from '@/lib/terrain/load'
import { worldAt } from './terrainGeometry'

// Alberelli da plastico: faggi a palla nei boschi, ulivi bassi e larghi sulle colline vicino al
// mare. Le posizioni vengono dallo script dei dati (abruzzo.json), l'ombra a terra è già cotta.
const KINDS = [
  { height: 0.62, width: 0.4, palette: ['#4f7a3c', '#5d8744', '#466e36', '#6a9150'] },
  { height: 0.3, width: 0.38, palette: ['#93a07a', '#a3ad87', '#8a9873'] },
] as const

/** Numeri ripetibili dalla posizione: ogni albero ha sempre lo stesso colore e la stessa rotazione. */
const hash = (u: number, v: number) => {
  const x = Math.sin(u * 12.9898 + v * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function useTreeMesh(data: TerrainData, kind: 0 | 1, density: number) {
  const ref = useRef<InstancedMesh>(null)
  const trees = useMemo(() => data.meta.trees.filter((tree, i) => tree[2] === kind && (density >= 1 || i % Math.round(1 / density) === 0)), [data, kind, density])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const { height, width, palette } = KINDS[kind]
    const colors = palette.map((value) => new Color(value))
    const matrix = new Matrix4()
    const rotation = new Quaternion()
    const up = new Vector3(0, 1, 0)
    trees.forEach(([u, v, , scale], i) => {
      const random = hash(u, v)
      const [x, y, z] = worldAt(data, u, v)
      rotation.setFromAxisAngle(up, random * Math.PI * 2)
      const size = new Vector3(width * scale, height * scale, width * scale)
      matrix.compose(new Vector3(x, y + size.y * 0.55, z), rotation, size)
      mesh.setMatrixAt(i, matrix)
      mesh.setColorAt(i, colors[Math.floor(random * colors.length)])
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [data, kind, trees])

  return { ref, count: trees.length }
}

export function Trees({ data, density }: { data: TerrainData; density: number }) {
  const crown = useMemo(() => new IcosahedronGeometry(1, 1), [])
  const forest = useTreeMesh(data, 0, density)
  const olives = useTreeMesh(data, 1, density)
  return (
    <>
      <instancedMesh ref={forest.ref} args={[crown, undefined, forest.count]} frustumCulled={false}>
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={olives.ref} args={[crown, undefined, olives.count]} frustumCulled={false}>
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
    </>
  )
}
