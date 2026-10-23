import { PlaneGeometry, type BufferGeometry } from 'three'
import { heightToWorld, sampleHeight, uvToWorld } from '@/lib/terrain/geo'
import type { TerrainData } from '@/lib/terrain/load'

/** Quota del mondo nel punto u, v (0-1 della mappa). */
export function terrainHeightAt(data: TerrainData, u: number, v: number): number {
  const [w, h] = data.meta.grid
  return heightToWorld(sampleHeight(data.heights, w, h, u, v))
}

/** Punto del mondo (x, y, z) sopra il terreno in u, v. */
export function worldAt(data: TerrainData, u: number, v: number, lift = 0): [number, number, number] {
  const [x, z] = uvToWorld(u, v, data.meta)
  return [x, terrainHeightAt(data, u, v) + lift, z]
}

/**
 * Il diorama: griglia con le quote già sfumate a zero fuori dalla regione (la texture cotta fa il
 * resto). Le uv della PlaneGeometry hanno v = 1 a nord, come la riga in alto della texture.
 */
export function buildTerrainGeometry(data: TerrainData, segments: number): BufferGeometry {
  const { widthKm, heightKm } = data.meta
  const geometry = new PlaneGeometry(widthKm, heightKm, segments, Math.round((segments * heightKm) / widthKm))
  geometry.rotateX(-Math.PI / 2)
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const u = positions.getX(i) / widthKm + 0.5
    const v = positions.getZ(i) / heightKm + 0.5
    positions.setY(i, terrainHeightAt(data, u, v))
  }
  geometry.computeVertexNormals()
  return geometry
}
