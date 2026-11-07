import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PUBLISHED_FILE, publishToStorefront, publisherConfig } from '../publisher'
import { ContentImageStore, detectImageType } from '../image-store'

const content = { texts: { it: { 'hero.title': 'Nuovo' }, en: {}, de: {} }, shared: {} }

function storefront(): string {
  const dir = mkdtempSync(join(tmpdir(), 'vetrina-'))
  writeFileSync(join(dir, 'package.json'), '{}')
  mkdirSync(join(dir, 'src', 'data', 'published'), { recursive: true })
  return dir
}

describe('publishToStorefront', () => {
  let dir: string
  beforeEach(() => {
    dir = storefront()
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('scrive le modifiche nella vetrina e lancia la generazione', async () => {
    await publishToStorefront(content, { dir, command: 'node -e "require(\'fs\').writeFileSync(\'built\', \'ok\')"', timeoutMs: 30_000 })
    expect(JSON.parse(readFileSync(join(dir, PUBLISHED_FILE), 'utf8'))).toEqual(content)
    expect(readFileSync(join(dir, 'built'), 'utf8')).toBe('ok')
  })

  it('se la generazione fallisce rimette il file di prima e riporta l’errore', async () => {
    writeFileSync(join(dir, PUBLISHED_FILE), '{"texts":{},"shared":{}}')
    await expect(
      publishToStorefront(content, { dir, command: 'node -e "console.error(\'errore di build\'); process.exit(2)"', timeoutMs: 30_000 }),
    ).rejects.toThrow(/codice 2[\s\S]*errore di build/)
    expect(readFileSync(join(dir, PUBLISHED_FILE), 'utf8')).toBe('{"texts":{},"shared":{}}')
  })

  it('senza file precedente, un fallimento lo toglie', async () => {
    await expect(publishToStorefront(content, { dir, command: 'node -e "process.exit(1)"', timeoutMs: 30_000 })).rejects.toThrow()
    expect(existsSync(join(dir, PUBLISHED_FILE))).toBe(false)
  })

  it('dice dove impostare la cartella se non trova la vetrina', async () => {
    await expect(publishToStorefront(content, { dir: join(dir, 'manca'), timeoutMs: 1000 })).rejects.toThrow(/STOREFRONT_DIR/)
  })

  it('legge cartella e comando dall’ambiente', () => {
    expect(publisherConfig({ STOREFRONT_DIR: '/srv/vetrina', STOREFRONT_BUILD_COMMAND: 'npm run build' })).toMatchObject({
      dir: '/srv/vetrina',
      command: 'npm run build',
    })
    expect(publisherConfig({}).command).toBeUndefined()
  })
})

describe('ContentImageStore', () => {
  let dir: string
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'foto-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')])

  it('riconosce le foto dal contenuto', () => {
    expect(detectImageType(jpeg)?.extension).toBe('jpg')
    expect(detectImageType(webp)?.extension).toBe('webp')
    expect(detectImageType(Buffer.from('%PDF-1.7'))).toBeNull()
  })

  it('salva con un nome casuale e rilegge solo nomi validi', async () => {
    const store = new ContentImageStore(dir)
    const saved = await store.save(jpeg)
    if (!saved.ok) throw new Error(saved.error)
    expect(saved.url).toMatch(/^\/contenuti\/immagini\/[0-9a-f-]{36}\.jpg$/)
    expect(await store.read(saved.url.split('/').at(-1) as string)).toEqual(jpeg)
    expect(await store.read('../../.env')).toBeNull()
  })

  it('rifiuta file vuoti o che non sono foto', async () => {
    const store = new ContentImageStore(dir)
    expect((await store.save(Buffer.alloc(0))).ok).toBe(false)
    expect(await store.save(Buffer.from('%PDF-1.7'))).toEqual({ ok: false, error: 'Sono ammesse solo foto JPEG, PNG o WebP.' })
  })
})
