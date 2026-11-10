import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { AGENT_ROLE_ID, ensureRoles } from '../../src/lib/roles'
import { adminWithRoles } from '../helpers/admin'

jest.setTimeout(180 * 1000)

// Vetrina finta: la pubblicazione scrive il file delle modifiche, senza rigenerare il sito.
const storefront = mkdtempSync(join(tmpdir(), 'vetrina-'))
writeFileSync(join(storefront, 'package.json'), '{}')
mkdirSync(join(storefront, 'src', 'data', 'published'), { recursive: true })
process.env.STOREFRONT_DIR = storefront
delete process.env.STOREFRONT_BUILD_COMMAND
process.env.CONTENT_IMAGES_DIR = mkdtempSync(join(tmpdir(), 'foto-'))

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])

type Status = { entries: { key: string; scope: string; draft: string | null; published: string | null }[]; pending: number; publication: { status: string; error: string | null } | null }

// Sezione Contenuti: bozza, foto, pubblicazione nella vetrina, permessi.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let admin: { headers: Record<string, string> }
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }
    const status = async (): Promise<Status> => (await api.get('/admin/contenuti', admin)).data

    async function publishAndWait(): Promise<Status> {
      expect((await api.post('/admin/contenuti/pubblica', {}, admin)).status).toBe(202)
      for (let i = 0; i < 50; i++) {
        const current = await status()
        if (current.publication?.status !== 'running') return current
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      throw new Error('La pubblicazione non finisce.')
    }

    beforeEach(async () => {
      await ensureRoles(getContainer())
      admin = await adminWithRoles(getContainer(), `titolare-${Date.now()}@test.local`)
    })

    it('mostra sezioni e campi con i testi di partenza', async () => {
      const { data } = await api.get('/admin/contenuti/schema', admin)
      const hero = data.sections.find((section: { id: string }) => section.id === 'hero')
      expect(hero.fields.find((field: { key: string }) => field.key === 'hero.title').defaults.it).toBe('Le Quote')
    })

    it('salva in bozza, pubblica nella vetrina e segna le modifiche come online', async () => {
      await api.post('/admin/contenuti/testi', { key: 'hero.subtitle', scope: 'en', value: 'From the sea to the mountains.' }, admin)
      await api.post('/admin/contenuti/testi', { key: 'business.BANK_TRANSFER.iban', scope: 'shared', value: 'IT60X0542811101000000123456' }, admin)
      const upload = await api.post('/admin/contenuti/immagini', { file_base64: JPEG.toString('base64') }, admin)
      expect(upload.status).toBe(201)
      await api.post('/admin/contenuti/testi', { key: 'hero.poster', scope: 'shared', value: upload.data.url }, admin)
      expect((await status()).pending).toBe(3)

      const after = await publishAndWait()
      expect(after.publication).toMatchObject({ status: 'done', error: null })
      expect(after.pending).toBe(0)

      const written = JSON.parse(readFileSync(join(storefront, 'src', 'data', 'published', 'published.generated.json'), 'utf8'))
      expect(written.texts.en['hero.subtitle']).toBe('From the sea to the mountains.')
      expect(written.shared).toMatchObject({ 'hero.poster': upload.data.url, 'hero.posterSmall': upload.data.url })

      // La foto è pubblica, servita da Medusa per la vetrina.
      const photo = await api.get(upload.data.url, { responseType: 'arraybuffer' })
      expect(photo.headers['content-type']).toBe('image/jpeg')
      expect(Buffer.from(photo.data)).toEqual(JPEG)
      expect((await api.get('/contenuti/immagini/00000000-0000-0000-0000-000000000000.jpg').catch(fail)).status).toBe(404)
    })

    it('tornare al testo di partenza e pubblicare toglie la modifica', async () => {
      await api.post('/admin/contenuti/testi', { key: 'hero.title', scope: 'it', value: 'Le Quote Bio' }, admin)
      await publishAndWait()
      await api.post('/admin/contenuti/testi', { key: 'hero.title', scope: 'it', value: null }, admin)
      expect((await status()).pending).toBe(1)
      await publishAndWait()
      expect((await status()).entries.find((entry) => entry.key === 'hero.title')).toBeUndefined()
    })

    it('annulla riporta la bozza a com’è online', async () => {
      await api.post('/admin/contenuti/testi', { key: 'olio.title', scope: 'it', value: 'Olio nuovo' }, admin)
      await publishAndWait()
      await api.post('/admin/contenuti/testi', { key: 'olio.title', scope: 'it', value: 'Olio sbagliato' }, admin)
      await api.post('/admin/contenuti/testi', { key: 'miele.title', scope: 'it', value: 'Miele sbagliato' }, admin)
      expect((await api.post('/admin/contenuti/annulla', {}, admin)).data.discarded).toBe(2)
      const { entries, pending } = await status()
      expect(pending).toBe(0)
      expect(entries.find((entry) => entry.key === 'olio.title')).toMatchObject({ draft: 'Olio nuovo', published: 'Olio nuovo' })
      expect(entries.find((entry) => entry.key === 'miele.title')).toBeUndefined()
    })

    it('rifiuta contenuti sconosciuti, diciture di legge e foto non caricate', async () => {
      const post = (body: object) => api.post('/admin/contenuti/testi', body, admin).catch(fail)
      expect((await post({ key: 'hero.nonEsiste', scope: 'it', value: 'x' })).status).toBe(400)
      const locked = await post({ key: 'checkoutUi.submit', scope: 'it', value: 'Ordina' })
      expect(locked.status).toBe(400)
      expect(locked.data.message).toContain('art. 51')
      expect((await post({ key: 'hero.poster', scope: 'shared', value: 'https://altrosito.it/foto.jpg' })).status).toBe(400)
      const notImage = await api.post('/admin/contenuti/immagini', { file_base64: Buffer.from('%PDF-1.7').toString('base64') }, admin).catch(fail)
      expect(notImage.status).toBe(400)
    })

    it('l’agente non vede né modifica i contenuti', async () => {
      const agent = await adminWithRoles(getContainer(), 'bruno@test.local', [AGENT_ROLE_ID])
      expect((await api.get('/admin/contenuti', agent).catch(fail)).status).toBe(403)
      expect((await api.post('/admin/contenuti/testi', { key: 'hero.title', scope: 'it', value: 'x' }, agent).catch(fail)).status).toBe(403)
      expect((await api.post('/admin/contenuti/pubblica', {}, agent).catch(fail)).status).toBe(403)
    })
  },
})
