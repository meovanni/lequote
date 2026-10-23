import { decodeHeight, type TerrainMeta } from './geo'

export type TerrainData = {
  meta: TerrainMeta
  /** Quote in metri, riga per riga da nord a sud. */
  heights: Float32Array
  /** 0-1: quanto il punto sta dentro la regione (bordo sfumato). */
  mask: Float32Array
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Immagine del rilievo non caricata: ${src}`))
    image.src = src
  })
}

/** Legge la mappa delle quote e i metadati da public/terrain (solo nel browser). */
export async function loadTerrain(base = '/terrain'): Promise<TerrainData> {
  const [metaResponse, image] = await Promise.all([fetch(`${base}/abruzzo.json`), loadImage(`${base}/abruzzo-height.png`)])
  if (!metaResponse.ok) throw new Error(`Metadati del rilievo non caricati (${metaResponse.status})`)
  const meta = (await metaResponse.json()) as TerrainMeta

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas 2D non disponibile')
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data

  const count = canvas.width * canvas.height
  const heights = new Float32Array(count)
  const mask = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    heights[i] = decodeHeight(pixels[i * 4], pixels[i * 4 + 1])
    mask[i] = pixels[i * 4 + 2] / 255
  }
  return { meta: { ...meta, grid: [canvas.width, canvas.height] }, heights, mask }
}
