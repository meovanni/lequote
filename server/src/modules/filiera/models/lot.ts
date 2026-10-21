import { model } from '@medusajs/framework/utils'
import type { StageFieldValue } from '../lib/public-lot'
import { Campaign } from './campaign'
import { Supplier } from './registries'

// Lotto (D.Lgs. 231/2017 art. 17): il codice è quello stampato in etichetta, già normalizzato
// da parseLotCode prima del salvataggio. Nasce in bozza: diventa visibile al pubblico solo
// quando i dati obbligatori sono completi e qualcuno lo pubblica.
export const Lot = model
  .define('filiera_lot', {
    id: model.id({ prefix: 'lot' }).primaryKey(),
    code: model.text().unique().searchable(),
    status: model.enum(['draft', 'published']).default('draft'),
    product_line: model.enum(['olio', 'miele']),
    product_name: model.text(),
    nominal_quantity: model.text().nullable(),
    origin: model.text().default('Italia'),
    packaging_date: model.dateTime().nullable(),
    best_before: model.dateTime().nullable(),
    units: model.number().nullable(),
    notes: model.text().nullable(),
    campaign: model.belongsTo(() => Campaign, { mappedBy: 'lots' }),
    // Stabilimento di confezionamento (dicitura di legge): un fornitore, o in futuro il laboratorio aziendale.
    packaging_establishment: model.belongsTo(() => Supplier, { mappedBy: 'packaged_lots' }).nullable(),
    stages: model.hasMany(() => LotStage, { mappedBy: 'lot' }),
  })
  .cascades({ delete: ['stages'] })

// Fase effettiva di un lotto. I campi sono copiati dal modello di fase al momento della
// compilazione (etichetta, visibilità, valore): se il modello cambia l'anno dopo, la storia dei
// lotti già prodotti resta quella di allora.
export const LotStage = model.define('filiera_lot_stage', {
  id: model.id({ prefix: 'lst' }).primaryKey(),
  name: model.text(),
  position: model.number(),
  date: model.dateTime().nullable(),
  place: model.text().nullable(),
  fields: model.json<StageFieldValue[]>(),
  template_id: model.text().nullable(),
  lot: model.belongsTo(() => Lot, { mappedBy: 'stages' }),
})
