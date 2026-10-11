import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Archivio dei referti di analisi fuori dalla cartella pubblica di Medusa (static/): i file
// interni non devono essere raggiungibili da chi indovina un indirizzo. Nomi casuali, tipo
// verificato dal contenuto e non dall'estensione. Niente servizi esterni a pagamento: sul VPS
// la cartella rientra nei backup del server.

export const MAX_FILE_BYTES = 15 * 1024 * 1024

const KEY = /^[0-9a-f-]{36}\.(pdf|png|jpg)$/

type FileType = { extension: 'pdf' | 'png' | 'jpg'; contentType: string }

export function detectFileType(data: Buffer): FileType | null {
  if (data.subarray(0, 5).toString('latin1') === '%PDF-') return { extension: 'pdf', contentType: 'application/pdf' }
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: 'png', contentType: 'image/png' }
  }
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { extension: 'jpg', contentType: 'image/jpeg' }
  }
  return null
}

export function contentTypeForKey(key: string): string {
  if (key.endsWith('.pdf')) return 'application/pdf'
  if (key.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}

export type SaveResult = { ok: true; key: string; contentType: string } | { ok: false; error: string }

export class PrivateFileStore {
  constructor(private readonly dir: string) {}

  private pathFor(key: string): string {
    if (!KEY.test(key)) throw new Error('Chiave di file non valida.')
    return join(this.dir, key)
  }

  async save(data: Buffer): Promise<SaveResult> {
    if (data.length === 0) return { ok: false, error: 'Il file è vuoto.' }
    if (data.length > MAX_FILE_BYTES) return { ok: false, error: 'Il file supera 15 MB.' }
    const type = detectFileType(data)
    if (!type) return { ok: false, error: 'Sono ammessi solo PDF, PNG e JPEG.' }

    const key = `${randomUUID()}.${type.extension}`
    await mkdir(this.dir, { recursive: true })
    await writeFile(this.pathFor(key), data, { flag: 'wx' })
    return { ok: true, key, contentType: type.contentType }
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.pathFor(key))
  }

  async remove(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true })
  }
}

/** Cartella dei file privati: FILIERA_FILES_DIR, altrimenti server/private/filiera. */
export function filieraFileStore(): PrivateFileStore {
  return new PrivateFileStore(process.env.FILIERA_FILES_DIR || join(process.cwd(), 'private', 'filiera'))
}
