import { model } from '@medusajs/framework/utils'
import { Apiary, Grove, Supplier } from './registries'
import { Lot } from './lot'

// Campagna di raccolta (olio) o di produzione (miele). Le analisi si fanno una volta l'anno e
// valgono per tutti i lotti della campagna.
export const Campaign = model.define('filiera_campaign', {
  id: model.id({ prefix: 'cmp' }).primaryKey(),
  product_line: model.enum(['olio', 'miele']),
  label: model.text(),
  harvest_start: model.dateTime().nullable(),
  harvest_end: model.dateTime().nullable(),
  notes: model.text().nullable(),
  // Frantoio della campagna: un fornitore (di norma con tipologia Frantoio).
  mill: model.belongsTo(() => Supplier, { mappedBy: 'milled_campaigns' }).nullable(),
  groves: model.manyToMany(() => Grove, { mappedBy: 'campaigns' }),
  apiaries: model.manyToMany(() => Apiary, { mappedBy: 'campaigns' }),
  analyses: model.hasMany(() => Analysis, { mappedBy: 'campaign' }),
  lots: model.hasMany(() => Lot, { mappedBy: 'campaign' }),
})

export const Analysis = model.define('filiera_analysis', {
  id: model.id({ prefix: 'anl' }).primaryKey(),
  title: model.text(),
  lab: model.text().nullable(),
  date: model.dateTime().nullable(),
  // Chiave nell'archivio privato (lib/private-files.ts), mai un indirizzo pubblico.
  file_key: model.text(),
  content_type: model.text(),
  visibility: model.enum(['public', 'internal']).default('internal'),
  results: model.json().nullable(),
  campaign: model.belongsTo(() => Campaign, { mappedBy: 'analyses' }),
})
