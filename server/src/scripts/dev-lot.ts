import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { FILIERA_MODULE } from '../modules/filiera'
import type FilieraModuleService from '../modules/filiera/service'

// Solo sviluppo e test end-to-end: un lotto d'olio pubblicato, così pagina /lotto/:codice e QR
// in etichetta si possono provare. I lotti veri si creano dal back office.
const DEV_LOT_CODE = 'L2025-01'

export default async function devLot({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-lot è solo per lo sviluppo: in produzione i lotti si creano dal back office.')
  }

  const filiera: FilieraModuleService = container.resolve(FILIERA_MODULE)
  const [existing] = await filiera.listLots({ code: DEV_LOT_CODE })
  if (existing) {
    logger.info(`Lotto di prova ${DEV_LOT_CODE} già presente.`)
    return
  }

  const templates = await filiera.listStageTemplates({ product_line: 'olio' }, { order: { position: 'ASC' } })
  if (templates.length === 0) throw new Error('Mancano i modelli di fase dell’olio: lancia prima "npm run seed".')

  // Il frantoio di prova macina e imbottiglia, come quello vero (tipologie create dalla migrazione).
  const types = await filiera.listSupplierTypes({ code: ['frantoio', 'imbottigliamento'] })
  const establishment = await filiera.createSuppliers({
    name: 'Frantoio di prova',
    municipality: 'Atri',
    province: 'TE',
    types: types.map((type) => type.id),
  })
  const campaign = await filiera.createCampaigns({ product_line: 'olio', label: '2025/26', mill_id: establishment.id })
  const lot = await filiera.createLotChecked({
    code: DEV_LOT_CODE,
    product_line: 'olio',
    product_name: 'Olio extravergine di oliva',
    campaign_id: campaign.id,
  })
  await filiera.updateLotChecked(lot.id, {
    nominal_quantity: '0,75 l',
    best_before: new Date('2027-06-30'),
    packaging_date: new Date('2025-12-10'),
    packaging_establishment_id: establishment.id,
  })

  const values: Record<string, Record<string, string>> = {
    Raccolta: { varieta: 'Leccino, Moraiolo', metodo: 'Brucatura con agevolatori' },
    Molitura: { metodo: 'Estrazione a freddo, ciclo continuo a due fasi' },
  }
  const dates: Record<string, string> = { Raccolta: '2025-10-20', Molitura: '2025-10-21', Imbottigliamento: '2025-12-10' }
  await filiera.replaceLotStages(
    lot.id,
    templates.map((template) => ({
      template_id: template.id,
      date: dates[template.name] ? new Date(dates[template.name]) : null,
      place: template.name === 'Raccolta' ? 'Roseto degli Abruzzi' : 'Atri',
      values: values[template.name] ?? {},
    })),
  )
  await filiera.publishLot(lot.id)
  logger.info(`Lotto di prova ${DEV_LOT_CODE} pubblicato.`)
}
