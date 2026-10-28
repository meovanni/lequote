import type { Context } from '@medusajs/framework/types'
import { InjectTransactionManager, MedusaContext, MedusaError, MedusaService } from '@medusajs/framework/utils'
import type { AnalysisResults } from './lib/analysis-values'
import { toPublicAnalyses, type PublicCampaignAnalyses } from './lib/public-analyses'
import { toPublicLot, type LotRecord, type PublicLot } from './lib/public-lot'
import { bestBeforeFor } from './lib/lot-label'
import { publishBlockers } from './lib/publish-check'
import { buildLotStages, type StageValuesInput, type TemplateForBuild } from './lib/stage-builder'
import { Analysis, Campaign } from './models/campaign'
import { Lot, LotStage } from './models/lot'
import { Apiary, Grove, Supplier, SupplierType } from './models/registries'
import { StageTemplate } from './models/stage-template'

const PUBLIC_LOT_RELATIONS = ['campaign', 'campaign.analyses', 'packaging_establishment', 'stages']

export type LotChanges = {
  code?: string
  product_line?: 'olio' | 'miele'
  product_name?: string
  nominal_quantity?: string | null
  origin?: string
  packaging_date?: Date | null
  best_before?: Date | null
  units?: number | null
  notes?: string | null
  campaign_id?: string
  packaging_establishment_id?: string | null
}

export type LotInput = LotChanges & Required<Pick<LotChanges, 'code' | 'product_line' | 'product_name' | 'campaign_id'>>

export type RegistryKind = 'groves' | 'apiaries' | 'suppliers'

// Dati che identificano il lotto stampato: su un lotto pubblico cambiarli renderebbe orfane
// etichette e QR già in circolazione, o scambierebbe le analisi mostrate.
const IDENTITY_FIELDS = ['code', 'product_line', 'campaign_id'] as const

function isoDate(value: Date | string | null | undefined): string | null {
  if (!value) return null
  return new Date(value).toISOString().slice(0, 10)
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

class FilieraModuleService extends MedusaService({
  Grove,
  Apiary,
  Supplier,
  SupplierType,
  StageTemplate,
  Campaign,
  Analysis,
  Lot,
  LotStage,
}) {
  /** Lotto pubblicato nella sola forma visibile al consumatore, oppure null. */
  async retrievePublicLot(code: string): Promise<PublicLot | null> {
    const [lot] = await this.listLots({ code }, { relations: PUBLIC_LOT_RELATIONS, take: 1 })
    if (!lot) return null

    // Solo i campi che la proiezione pubblica può usare: i dati interni non vengono nemmeno letti.
    const record: LotRecord = {
      code: lot.code,
      status: lot.status,
      product_line: lot.product_line,
      product_name: lot.product_name,
      nominal_quantity: lot.nominal_quantity,
      origin: lot.origin,
      packaging_date: isoDate(lot.packaging_date),
      best_before: isoDate(lot.best_before),
      campaign: lot.campaign
        ? {
            label: lot.campaign.label,
            harvest_start: isoDate(lot.campaign.harvest_start),
            harvest_end: isoDate(lot.campaign.harvest_end),
            analyses: (lot.campaign.analyses ?? []).map((analysis) => ({
              id: analysis.id,
              title: analysis.title,
              lab: analysis.lab,
              date: isoDate(analysis.date),
              visibility: analysis.visibility,
              results: (analysis.results as AnalysisResults | null) ?? null,
            })),
          }
        : null,
      packaging_establishment: lot.packaging_establishment
        ? {
            name: lot.packaging_establishment.name,
            municipality: lot.packaging_establishment.municipality,
            province: lot.packaging_establishment.province,
          }
        : null,
      stages: (lot.stages ?? []).map((stage) => ({
        name: stage.name,
        position: stage.position,
        date: isoDate(stage.date),
        place: stage.place,
        fields: stage.fields ?? [],
      })),
    }

    return toPublicLot(record)
  }

  /** Analisi pubbliche per linea, dalla campagna più recente (lib/public-analyses.ts). */
  async listPublicAnalyses(line?: 'olio' | 'miele'): Promise<PublicCampaignAnalyses[]> {
    const campaigns = await this.listCampaigns(line ? { product_line: line } : {}, { relations: ['analyses', 'lots'] })
    return toPublicAnalyses(
      campaigns.map((campaign) => ({
        product_line: campaign.product_line,
        label: campaign.label,
        harvest_start: isoDate(campaign.harvest_start),
        analyses: (campaign.analyses ?? []).map((analysis) => ({
          id: analysis.id,
          title: analysis.title,
          lab: analysis.lab,
          date: isoDate(analysis.date),
          visibility: analysis.visibility,
          results: (analysis.results as AnalysisResults | null) ?? null,
        })),
        lots: (campaign.lots ?? []).map((lot) => ({ status: lot.status })),
      })),
    )
  }

  /** Blocca la riga del lotto fino alla fine della transazione: niente controlli superati da scritture concorrenti. */
  private async lockLot(id: string, context: Context) {
    const manager = context.transactionManager as { execute: (sql: string, params: unknown[]) => Promise<unknown> } | undefined
    if (typeof manager?.execute !== 'function') {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, 'Operazione sul lotto fuori da una transazione.')
    }
    await manager.execute('select id from filiera_lot where id = ? for update', [id])
    return this.retrieveLot(id, { relations: ['stages'] }, context)
  }

  private blockersFor(lot: Awaited<ReturnType<FilieraModuleService['lockLot']>>, changes: LotChanges = {}) {
    return publishBlockers({
      code: lot.code,
      product_name: lot.product_name,
      origin: lot.origin,
      nominal_quantity: lot.nominal_quantity,
      best_before: lot.best_before,
      campaign_id: lot.campaign_id,
      packaging_establishment_id: lot.packaging_establishment_id,
      ...changes,
      stages: (lot.stages ?? []).map((stage) => ({ name: stage.name, fields: stage.fields ?? [] })),
    })
  }

  private async assertCampaignLine(campaignId: string, productLine: string, context: Context) {
    const campaign = await this.retrieveCampaign(campaignId, {}, context)
    if (campaign.product_line !== productLine) {
      invalid(`La campagna ${campaign.label} è di ${campaign.product_line}, il lotto di ${productLine}.`)
    }
  }

  /** Dati mancanti per pubblicare il lotto (vuoto se è pubblicabile). */
  async lotPublishBlockers(id: string): Promise<string[]> {
    const lot = await this.retrieveLot(id, { relations: ['stages'] })
    return this.blockersFor(lot)
  }

  @InjectTransactionManager()
  async createLotChecked(data: LotInput, @MedusaContext() context: Context = {}) {
    await this.assertCampaignLine(data.campaign_id, data.product_line, context)
    const best_before = bestBeforeFor({}, data)
    return this.createLots({ ...data, ...(best_before ? { best_before } : {}), status: 'draft' }, context)
  }

  @InjectTransactionManager()
  async publishLot(id: string, @MedusaContext() context: Context = {}) {
    const lot = await this.lockLot(id, context)
    const blockers = this.blockersFor(lot)
    if (blockers.length > 0) invalid(`Il lotto non è pubblicabile, mancano: ${blockers.join(', ')}.`)
    return this.updateLots({ id, status: 'published' }, context)
  }

  @InjectTransactionManager()
  async unpublishLot(id: string, @MedusaContext() context: Context = {}) {
    await this.lockLot(id, context)
    return this.updateLots({ id, status: 'draft' }, context)
  }

  /** Modifica un lotto. Se è pubblico non se ne cambia l'identità e non lo si rende incompleto. */
  @InjectTransactionManager()
  async updateLotChecked(id: string, changes: LotChanges, @MedusaContext() context: Context = {}) {
    const lot = await this.lockLot(id, context)

    // Il termine minimo segue il confezionamento (18 mesi) finché non lo si cambia a mano.
    const best_before = bestBeforeFor(lot, changes)
    if (best_before) changes = { ...changes, best_before }

    if (lot.status === 'published') {
      const identity = IDENTITY_FIELDS.filter((key) => changes[key] !== undefined && changes[key] !== lot[key])
      if (identity.length > 0) {
        invalid('Il lotto è pubblico: codice, linea e campagna non si cambiano. Ritiralo dalla pubblicazione per modificarli.')
      }
      const blockers = this.blockersFor(lot, changes)
      if (blockers.length > 0) {
        invalid(`Il lotto è pubblico: la modifica lascerebbe vuoti ${blockers.join(', ')}. Ritiralo dalla pubblicazione per modificarlo.`)
      }
    }

    if (changes.campaign_id || changes.product_line) {
      await this.assertCampaignLine(changes.campaign_id ?? lot.campaign_id, changes.product_line ?? lot.product_line, context)
    }
    return this.updateLots({ id, ...changes }, context)
  }

  /** Sostituisce le fasi del lotto, ricostruendole dai modelli: dal back office arrivano solo i valori. */
  @InjectTransactionManager()
  async replaceLotStages(lotId: string, inputs: StageValuesInput[], @MedusaContext() context: Context = {}) {
    const lot = await this.lockLot(lotId, context)
    const templates = (await this.listStageTemplates({ product_line: lot.product_line }, {}, context)) as TemplateForBuild[]
    const built = buildLotStages(lot.product_line, templates, inputs)
    if (!built.ok) invalid(built.error)

    if (lot.status === 'published') {
      const blockers = publishBlockers({ ...lot, stages: built.stages })
      if (blockers.length > 0) invalid(`Il lotto è pubblico: mancano ${blockers.join(', ')}.`)
    }

    const existing = await this.listLotStages({ lot_id: lotId }, {}, context)
    if (existing.length > 0) await this.deleteLotStages(existing.map((stage) => stage.id), context)
    return this.createLotStages(built.stages.map((stage) => ({ ...stage, lot_id: lotId })), context)
  }

  @InjectTransactionManager()
  async deleteDraftLot(id: string, @MedusaContext() context: Context = {}) {
    const lot = await this.lockLot(id, context)
    if (lot.status === 'published') {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'Un lotto pubblico non si elimina: ritiralo prima dalla pubblicazione.')
    }
    await this.deleteLots(id, context)
  }

  /** Una voce d'anagrafica si elimina solo se nessuna campagna o nessun lotto la usa. */
  @InjectTransactionManager()
  async deleteRegistryItem(kind: RegistryKind, id: string, @MedusaContext() context: Context = {}) {
    const usage = await this.registryUsage(kind, id, context)
    if (usage > 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `In uso da ${usage} tra campagne e lotti: non si può eliminare.`)
    }
    if (kind === 'groves') await this.deleteGroves(id, context)
    if (kind === 'apiaries') await this.deleteApiaries(id, context)
    if (kind === 'suppliers') await this.deleteSuppliers(id, context)
  }

  private async registryUsage(kind: RegistryKind, id: string, context: Context): Promise<number> {
    switch (kind) {
      case 'groves':
        return ((await this.retrieveGrove(id, { relations: ['campaigns'] }, context)).campaigns ?? []).length
      case 'apiaries':
        return ((await this.retrieveApiary(id, { relations: ['campaigns'] }, context)).campaigns ?? []).length
      case 'suppliers': {
        const supplier = await this.retrieveSupplier(id, { relations: ['milled_campaigns', 'packaged_lots'] }, context)
        return (supplier.milled_campaigns ?? []).length + (supplier.packaged_lots ?? []).length
      }
    }
  }

  /** Una tipologia si elimina solo se nessun fornitore la usa; quelle di sistema mai. */
  @InjectTransactionManager()
  async deleteSupplierTypeChecked(id: string, @MedusaContext() context: Context = {}) {
    const type = await this.retrieveSupplierType(id, { relations: ['suppliers'] }, context)
    if (type.code) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `«${type.name}» è una tipologia di sistema: non si può eliminare.`)
    }
    if ((type.suppliers ?? []).length > 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `«${type.name}» è usata da ${type.suppliers.length} fornitori: non si può eliminare.`)
    }
    await this.deleteSupplierTypes(id, context)
  }

  /** Elimina una campagna senza lotti, con le sue analisi. Restituisce le chiavi dei file da rimuovere. */
  @InjectTransactionManager()
  async deleteEmptyCampaign(id: string, @MedusaContext() context: Context = {}): Promise<string[]> {
    const campaign = await this.retrieveCampaign(id, { relations: ['lots', 'analyses'] }, context)
    if ((campaign.lots ?? []).length > 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'La campagna ha dei lotti: non si può eliminare.')
    }
    const analyses = campaign.analyses ?? []
    if (analyses.length > 0) await this.deleteAnalyses(analyses.map((analysis) => analysis.id), context)
    await this.deleteCampaigns(id, context)
    return analyses.map((analysis) => analysis.file_key)
  }
}

export default FilieraModuleService
