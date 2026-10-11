import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MAX_FILE_BYTES, PrivateFileStore, detectFileType } from '../private-files'

const PDF = Buffer.from('%PDF-1.7\n%âãÏÓ\n')
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0])

describe('detectFileType', () => {
  it('riconosce PDF, PNG e JPEG dal contenuto', () => {
    expect(detectFileType(PDF)).toEqual({ extension: 'pdf', contentType: 'application/pdf' })
    expect(detectFileType(PNG)).toEqual({ extension: 'png', contentType: 'image/png' })
    expect(detectFileType(JPG)).toEqual({ extension: 'jpg', contentType: 'image/jpeg' })
  })

  it('rifiuta qualunque altro contenuto, anche se si chiama .pdf', () => {
    expect(detectFileType(Buffer.from('<html><script>alert(1)</script>'))).toBeNull()
    expect(detectFileType(Buffer.alloc(0))).toBeNull()
  })
})

describe('PrivateFileStore', () => {
  let dir: string
  let store: PrivateFileStore

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'lequote-files-'))
    store = new PrivateFileStore(dir)
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('salva con un nome casuale e rilegge lo stesso contenuto', async () => {
    const saved = await store.save(PDF)
    expect(saved.ok).toBe(true)
    if (!saved.ok) return
    expect(saved.key).toMatch(/^[0-9a-f-]{36}\.pdf$/)
    expect(await store.read(saved.key)).toEqual(PDF)
  })

  it('rifiuta file vuoti, troppo grandi o di tipo non ammesso', async () => {
    expect(await store.save(Buffer.alloc(0))).toEqual({ ok: false, error: 'Il file è vuoto.' })
    expect((await store.save(Buffer.concat([PDF, Buffer.alloc(MAX_FILE_BYTES)]))).ok).toBe(false)
    expect(await store.save(Buffer.from('ciao'))).toEqual({ ok: false, error: 'Sono ammessi solo PDF, PNG e JPEG.' })
    expect(readdirSync(dir)).toEqual([])
  })

  it('non esce dalla cartella con chiavi manipolate', async () => {
    await expect(store.read('../.env')).rejects.toThrow('Chiave di file non valida')
    await expect(store.remove('..\\..\\x.pdf')).rejects.toThrow('Chiave di file non valida')
  })

  it('elimina il file e tollera un file già assente', async () => {
    const saved = await store.save(PNG)
    if (!saved.ok) throw new Error(saved.error)
    await store.remove(saved.key)
    expect(readdirSync(dir)).toEqual([])
    await expect(store.remove(saved.key)).resolves.toBeUndefined()
  })
})
