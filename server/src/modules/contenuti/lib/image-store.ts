import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Foto caricate dalla sezione Contenuti: pubbliche (le mostra il sito), servite da Medusa su
// /contenuti/immagini/<nome>. Nomi casuali e tipo riconosciuto dal contenuto, non dall'estensione.
// Niente servizi esterni: sul VPS la cartella rientra nei backup del server (ADR 0004).

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export type ImageType = { extension: 'jpg' | 'png' | 'webp'; contentType: string }

const FILE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/

export function detectImageType(data: Buffer): ImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return { extension: 'jpg', contentType: 'image/jpeg' }
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: 'png', contentType: 'image/png' }
  }
  if (data.subarray(0, 4).toString('latin1') === 'RIFF' && data.subarray(8, 12).toString('latin1') === 'WEBP') {
    return { extension: 'webp', contentType: 'image/webp' }
  }
  return null
}

export const contentTypeFor = (name: string) =>
  name.endsWith('.png') ? 'image/png' : name.endsWith('.webp') ? 'image/webp' : 'image/jpeg'

export const isImageName = (name: string) => FILE_NAME.test(name)

export type SaveResult = { ok: true; url: string } | { ok: false; error: string }

export class ContentImageStore {
  constructor(private readonly dir: string) {}

  async save(data: Buffer): Promise<SaveResult> {
    if (data.length === 0) return { ok: false, error: 'Il file è vuoto.' }
    if (data.length > MAX_IMAGE_BYTES) return { ok: false, error: 'La foto supera 10 MB: riducila prima di caricarla.' }
    const type = detectImageType(data)
    if (!type) return { ok: false, error: 'Sono ammesse solo foto JPEG, PNG o WebP.' }

    const name = `${randomUUID()}.${type.extension}`
    await mkdir(this.dir, { recursive: true })
    await writeFile(join(this.dir, name), data, { flag: 'wx' })
    return { ok: true, url: `/contenuti/immagini/${name}` }
  }

  /** null se il nome non è valido o il file non c'è. */
  async read(name: string): Promise<Buffer | null> {
    if (!isImageName(name)) return null
    return readFile(join(this.dir, name)).catch(() => null)
  }
}

/** Cartella delle foto: CONTENT_IMAGES_DIR, altrimenti server/uploads/contenuti. */
export function contentImageStore(): ContentImageStore {
  return new ContentImageStore(process.env.CONTENT_IMAGES_DIR || join(process.cwd(), 'uploads', 'contenuti'))
}
