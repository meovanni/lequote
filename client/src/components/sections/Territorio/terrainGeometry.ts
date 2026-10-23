import { BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, PlaneGeometry } from 'three'
import { edgeFalloff, heightToWorld, sampleHeight, uvToWorld } from '@/lib/terrain/geo'
import type { TerrainData } from '@/lib/terrain/load'

export type TerrainPalette = {
  /** Sfondo della pagina: il plastico sfuma qui ai bordi. */
  background: Color
  /** Gesso della regione. */
  region: Color
  /** Terre fuori regione, un tono più scure. */
  outside: Color
  /** Mare piatto. */
  sea: Color
}

/** Quota del mondo nel punto u, v, già raccordata ai bordi come la mesh. */
export function terrainHeightAt(data: TerrainData, u: number, v: number): number {
  const [w, h] = data.meta.grid
  return heightToWorld(sampleHeight(data.heights, w, h, u, v)) * edgeFalloff(u, v)
}

/** Il plastico: griglia rialzata con le quote, colori per vertice (regione, fuori, mare). */
export function buildTerrainGeometry(data: TerrainData, palette: TerrainPalette, segments: number): BufferGeometry {
  const { widthKm, heightKm, grid } = data.meta
  const [w, h] = grid
  const segX = segments
  const segY = Math.round((segments * heightKm) / widthKm)
  const geometry = new PlaneGeometry(widthKm, heightKm, segX, segY)
  geometry.rotateX(-Math.PI / 2)

  const positions = geometry.attributes.position as BufferAttribute
  const colors = new Float32Array(positions.count * 3)
  const color = new Color()
  for (let i = 0; i < positions.count; i++) {
    const u = positions.getX(i) / widthKm + 0.5
    const v = positions.getZ(i) / heightKm + 0.5
    const falloff = edgeFalloff(u, v)
    const meters = sampleHeight(data.heights, w, h, u, v)
    const inside = sampleHeight(data.mask, w, h, u, v)
    positions.setY(i, heightToWorld(meters) * falloff)

    if (meters < 1 && inside < 0.5) color.copy(palette.sea)
    else color.copy(palette.outside).lerp(palette.region, inside)
    color.lerp(palette.background, 1 - falloff)
    colors.set([color.r, color.g, color.b], i * 3)
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

/** Contorno della regione appoggiato sul rilievo, appena sopra per non sparire nel terreno. */
export function buildOutlineGeometry(data: TerrainData): BufferGeometry {
  const points = data.meta.outline.flatMap(([u, v]) => {
    const [x, z] = uvToWorld(u, v, data.meta)
    return [x, terrainHeightAt(data, u, v) + 0.12, z]
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
  return geometry
}
