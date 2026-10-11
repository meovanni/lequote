import { medusaIntegrationTestRunner } from '@medusajs/test-utils'
import { Modules } from '@medusajs/framework/utils'
import jwt from 'jsonwebtoken'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

jest.setTimeout(180 * 1000)

const PDF_BASE64 = Buffer.from('%PDF-1.7\nreferto di prova\n').toString('base64')
const filesDir = mkdtempSync(join(tmpdir(), 'lequote-http-files-'))
process.env.FILIERA_FILES_DIR = filesDir
afterAll(() => rmSync(filesDir, { recursive: true, force: true }))

// Percorso completo del back office: anagrafiche, campagna, lotto, fasi, analisi, pubblicazione
// e consultazione pubblica. Ogni test parte da un database vuoto.
medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let admin: { headers: Record<string, string> }
    let store: { headers: Record<string, string> }
    const fail = (error: { response: unknown }) => error.response as { status: number; data: { message: string } }

    beforeEach(async () => {
      const container = getContainer()
      const user = await container.resolve(Modules.USER).createUsers({ email: 'amministrazione@test.local' })
      const identity = await container.resolve(Modules.AUTH).createAuthIdentities({
        provider_identities: [{ provider: 'emailpass', entity_id: 'amministrazione@test.local' }],
        app_metadata: { user_id: user.id },
      })
      const token = jwt.sign(
        { actor_id: user.id, actor_type: 'user', auth_identity_id: identity.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' },
      )
      admin = { headers: { authorization: `Bearer ${token}` } }

      const [key] = await container
        .resolve(Modules.API_KEY)
        .createApiKeys([{ title: 'Test', type: 'publishable', created_by: user.id }])
      store = { headers: { 'x-publishable-api-key': key.token } }
    })

    async function draftLot() {
      const establishment = await api.post(
        '/admin/filiera/registries/establishments',
        { name: 'Frantoio Beta', role: 'imbottigliamento', municipality: 'Atri', province: 'TE', internal_code: 'SIAN-42' },
        admin,
      )
      const template = await api.post(
        '/admin/filiera/stage-templates',
        {
          product_line: 'olio',
          name: 'Raccolta',
          position: 1,
          fields: [
            { key: 'varieta', label: 'Varietà', type: 'text', visibility: 'public', required: true },
            { key: 'registro', label: 'Registro di campagna', type: 'text', visibility: 'internal', required: false },
          ],
        },
        admin,
      )
      const campaign = await api.post('/admin/filiera/campaigns', { product_line: 'olio', label: '2025/26' }, admin)
      const lot = await api.post(
        '/admin/filiera/lots',
        { code: 'l 2026-07', product_line: 'olio', product_name: 'Olio extravergine di oliva', campaign_id: campaign.data.campaign.id },
        admin,
      )
      return {
        lot: lot.data.lot,
        establishmentId: establishment.data.item.id as string,
        templateId: template.data.template.id as string,
        campaignId: campaign.data.campaign.id as string,
      }
    }

    async function publishedLot() {
      const context = await draftLot()
      await api.post(
        `/admin/filiera/lots/${context.lot.id}`,
        { nominal_quantity: '0,75 l', best_before: '2027-12-31', packaging_establishment_id: context.establishmentId },
        admin,
      )
      await api.post(
        `/admin/filiera/lots/${context.lot.id}/stages`,
        { stages: [{ template_id: context.templateId, date: '2025-10-20', place: 'Roseto degli Abruzzi', values: { varieta: 'Leccino', registro: 'REG-77' } }] },
        admin,
      )
      await api.post(`/admin/filiera/lots/${context.lot.id}/publish`, {}, admin)
      return context
    }

    it('rifiuta le rotte del back office senza accesso', async () => {
      const response = await api.get('/admin/filiera/lots').catch(fail)
      expect(response.status).toBe(401)
    })

    it('normalizza il codice e crea il lotto in bozza', async () => {
      const { lot } = await draftLot()
      expect(lot.code).toBe('L2026-07')
      expect(lot.status).toBe('draft')
    })

    it('rifiuta codici non validi e date inesistenti', async () => {
      const { lot, campaignId } = await draftLot()
      const code = await api
        .post('/admin/filiera/lots', { code: 'L20/26', product_line: 'olio', product_name: 'Olio', campaign_id: campaignId }, admin)
        .catch(fail)
      expect(code.status).toBe(400)
      const date = await api.post(`/admin/filiera/lots/${lot.id}`, { best_before: '2027-02-31' }, admin).catch(fail)
      expect(date.status).toBe(400)
    })

    it('non pubblica un lotto incompleto, che resta invisibile', async () => {
      const { lot } = await draftLot()
      const blocked = await api.post(`/admin/filiera/lots/${lot.id}/publish`, {}, admin).catch(fail)
      expect(blocked.status).toBe(400)
      expect(blocked.data.message).toContain('Quantità nominale')

      const hidden = await api.get('/store/filiera/lots/l2026-07', store).catch(fail)
      expect(hidden.status).toBe(404)
    })

    it('mostra al pubblico il percorso del lotto pubblicato', async () => {
      await publishedLot()
      const lookup = await api.get('/store/filiera/lots/l2026-07', store)
      expect(lookup.data.lot.stages[0].fields).toEqual([{ label: 'Varietà', value: 'Leccino' }])
      expect(JSON.stringify(lookup.data)).not.toMatch(/SIAN-42|REG-77/)
    })

    it('ignora visibilità e obbligatorietà inviate dal browser', async () => {
      const { lot, templateId } = await draftLot()
      const response = await api
        .post(
          `/admin/filiera/lots/${lot.id}/stages`,
          { stages: [{ template_id: templateId, values: { varieta: 'x' }, fields: [{ key: 'registro', visibility: 'public' }] }] },
          admin,
        )
        .catch(fail)
      expect(response.status).toBe(400)
    })

    it('serve le analisi pubbliche e nasconde quelle interne', async () => {
      const { campaignId } = await publishedLot()
      const pub = await api.post(
        `/admin/filiera/campaigns/${campaignId}/analyses`,
        { title: 'Analisi chimico-fisica', visibility: 'public', file_base64: PDF_BASE64 },
        admin,
      )
      const internal = await api.post(
        `/admin/filiera/campaigns/${campaignId}/analyses`,
        { title: 'Verbale', visibility: 'internal', file_base64: PDF_BASE64 },
        admin,
      )

      const lookup = await api.get('/store/filiera/lots/L2026-07', store)
      expect(lookup.data.lot.analyses).toEqual([
        expect.objectContaining({ title: 'Analisi chimico-fisica', url: `/filiera/analisi/${pub.data.analysis.id}` }),
      ])

      const download = await api.get(`/filiera/analisi/${pub.data.analysis.id}`)
      expect(download.status).toBe(200)
      expect(download.headers['content-type']).toContain('application/pdf')

      const hidden = await api.get(`/filiera/analisi/${internal.data.analysis.id}`).catch(fail)
      expect(hidden.status).toBe(404)
      const adminCopy = await api.get(`/admin/filiera/campaigns/${campaignId}/analyses/${internal.data.analysis.id}`, admin)
      expect(adminCopy.status).toBe(200)
    })

    it('rifiuta un file che non è un PDF né un\'immagine', async () => {
      const { campaignId } = await draftLot()
      const response = await api
        .post(
          `/admin/filiera/campaigns/${campaignId}/analyses`,
          { title: 'Finto', file_base64: Buffer.from('<script>alert(1)</script>').toString('base64') },
          admin,
        )
        .catch(fail)
      expect(response.status).toBe(400)
    })

    it('protegge i lotti pubblici e le anagrafiche in uso', async () => {
      const { lot, establishmentId } = await publishedLot()
      expect((await api.post(`/admin/filiera/lots/${lot.id}`, { nominal_quantity: null }, admin).catch(fail)).status).toBe(400)
      expect((await api.post(`/admin/filiera/lots/${lot.id}`, { code: 'L2026-99' }, admin).catch(fail)).status).toBe(400)
      expect((await api.delete(`/admin/filiera/lots/${lot.id}`, admin).catch(fail)).status).toBe(400)
      expect((await api.delete(`/admin/filiera/registries/establishments/${establishmentId}`, admin).catch(fail)).status).toBe(400)
    })

    it('una modifica parziale di un oliveto non cancella le varietà', async () => {
      const grove = await api.post(
        '/admin/filiera/registries/groves',
        { name: 'Borsacchio', municipality: 'Roseto degli Abruzzi', cultivars: ['Leccino', 'Frantoio'] },
        admin,
      )
      const updated = await api.post(`/admin/filiera/registries/groves/${grove.data.item.id}`, { name: 'Borsacchio alto' }, admin)
      expect(updated.data.item.cultivars).toEqual(['Leccino', 'Frantoio'])
    })

    it('rifiuta un tipo di anagrafica sconosciuto', async () => {
      const response = await api.get('/admin/filiera/registries/clienti', admin).catch(fail)
      expect(response.status).toBe(404)
    })
  },
})
