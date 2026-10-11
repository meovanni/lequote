import { moduleIntegrationTestRunner } from '@medusajs/test-utils'
import { FILIERA_MODULE } from '..'
import { Analysis, Campaign } from '../models/campaign'
import { Lot, LotStage } from '../models/lot'
import { Apiary, Establishment, Grove, Mill } from '../models/registries'
import { StageTemplate } from '../models/stage-template'
import type FilieraModuleService from '../service'

jest.setTimeout(120 * 1000)

moduleIntegrationTestRunner<FilieraModuleService>({
  moduleName: FILIERA_MODULE,
  moduleModels: [Grove, Apiary, Mill, Establishment, StageTemplate, Campaign, Analysis, Lot, LotStage],
  resolve: './src/modules/filiera',
  testSuite: ({ service }) => {
    async function setup() {
      const [establishment] = await service.createEstablishments([
        { name: 'Frantoio Beta', role: 'imbottigliamento', municipality: 'Atri', province: 'TE', internal_code: 'SIAN-999' },
      ])
      const [campaign] = await service.createCampaigns([{ product_line: 'olio', label: '2025/26' }])
      const [template] = await service.createStageTemplates([
        {
          product_line: 'olio',
          name: 'Molitura',
          position: 2,
          fields: [
            { key: 'metodo', label: 'Metodo di estrazione', type: 'text', visibility: 'public', required: true },
            { key: 'registro', label: 'Registro', type: 'text', visibility: 'internal', required: false },
          ],
        },
      ])
      await service.createAnalyses([
        { title: 'Analisi chimico-fisica', file_key: 'a.pdf', content_type: 'application/pdf', visibility: 'public', campaign_id: campaign.id },
        { title: 'Verbale riservato', file_key: 'b.pdf', content_type: 'application/pdf', visibility: 'internal', campaign_id: campaign.id },
      ])
      const lot = await service.createLotChecked({
        code: 'L2026-01',
        product_line: 'olio',
        product_name: 'Olio extravergine di oliva',
        nominal_quantity: '0,75 l',
        best_before: new Date('2027-12-31'),
        campaign_id: campaign.id,
        packaging_establishment_id: establishment.id,
      })
      return { establishment, campaign, template, lot }
    }

    async function publishedLot() {
      const context = await setup()
      await service.replaceLotStages(context.lot.id, [
        { template_id: context.template.id, date: null, place: 'Atri', values: { metodo: 'Ciclo continuo', registro: 'REG-INTERNO-7' } },
      ])
      await service.publishLot(context.lot.id)
      return context
    }

    describe('lotto pubblico', () => {
      it('restituisce un lotto pubblicato senza dati interni', async () => {
        await publishedLot()
        const lot = await service.retrievePublicLot('L2026-01')

        expect(lot!.campaign).toBe('2025/26')
        expect(lot!.stages[0].fields).toEqual([{ label: 'Metodo di estrazione', value: 'Ciclo continuo' }])
        expect(lot!.legal).toContainEqual({ label: 'Confezionato da', value: 'Frantoio Beta, Atri (TE)' })
        expect(lot!.analyses.map((analysis) => analysis.title)).toEqual(['Analisi chimico-fisica'])

        const serialised = JSON.stringify(lot)
        for (const secret of ['SIAN-999', 'REG-INTERNO-7', 'Verbale riservato', 'b.pdf', 'a.pdf']) {
          expect(serialised).not.toContain(secret)
        }
      })

      it('tratta un lotto in bozza come inesistente', async () => {
        await setup()
        expect(await service.retrievePublicLot('L2026-01')).toBeNull()
      })
    })

    describe('regole del back office', () => {
      it('non pubblica se manca un campo obbligatorio del modello', async () => {
        const { lot, template } = await setup()
        await service.replaceLotStages(lot.id, [{ template_id: template.id, date: null, place: null, values: {} }])
        await expect(service.publishLot(lot.id)).rejects.toThrow('Molitura: Metodo di estrazione')
      })

      it('rifiuta campi che il modello non prevede', async () => {
        const { lot, template } = await setup()
        await expect(
          service.replaceLotStages(lot.id, [{ template_id: template.id, date: null, place: null, values: { inventato: 'x' } }]),
        ).rejects.toThrow('non prevede il campo')
      })

      it('non cambia codice o campagna di un lotto pubblico', async () => {
        const { lot } = await publishedLot()
        await expect(service.updateLotChecked(lot.id, { code: 'L2026-99' })).rejects.toThrow('codice, linea e campagna')
        await expect(service.updateLotChecked(lot.id, { nominal_quantity: null })).rejects.toThrow('Quantità nominale')
        await expect(service.updateLotChecked(lot.id, { nominal_quantity: '0,5 l' })).resolves.toBeDefined()
      })

      it('rifiuta un lotto di olio su una campagna di miele', async () => {
        const [honey] = await service.createCampaigns([{ product_line: 'miele', label: '2026' }])
        await expect(
          service.createLotChecked({ code: 'L2026-02', product_line: 'olio', product_name: 'Olio', campaign_id: honey.id }),
        ).rejects.toThrow('è di miele')
      })

      it('non elimina uno stabilimento usato da un lotto', async () => {
        const { establishment } = await publishedLot()
        await expect(service.deleteRegistryItem('establishments', establishment.id)).rejects.toThrow('In uso da 1 lotti')
      })

      it('elimina una campagna vuota con le sue analisi e restituisce i file da rimuovere', async () => {
        const [campaign] = await service.createCampaigns([{ product_line: 'miele', label: '2026' }])
        await service.createAnalyses([{ title: 'Pollinica', file_key: 'c.pdf', content_type: 'application/pdf', campaign_id: campaign.id }])
        expect(await service.deleteEmptyCampaign(campaign.id)).toEqual(['c.pdf'])
      })

      it('rifiuta due lotti con lo stesso codice', async () => {
        const { campaign } = await setup()
        await expect(
          service.createLotChecked({ code: 'L2026-01', product_line: 'olio', product_name: 'Doppione', campaign_id: campaign.id }),
        ).rejects.toThrow()
      })
    })
  },
})
