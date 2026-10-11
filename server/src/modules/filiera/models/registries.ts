import { model } from '@medusajs/framework/utils'
import { Campaign } from './campaign'
import { Lot } from './lot'

// Anagrafiche riusate di campagna in campagna (ADR 0002). I codici di registro (SIAN, BDA,
// partita IVA dei fornitori) sono dati interni: la proiezione pubblica non li legge mai.

export const Grove = model.define('filiera_grove', {
  id: model.id({ prefix: 'grv' }).primaryKey(),
  name: model.text().searchable(),
  municipality: model.text(),
  province: model.text().nullable(),
  elevation_m: model.number().nullable(),
  area_ha: model.float().nullable(),
  cultivars: model.array(),
  sian_code: model.text().nullable(),
  notes: model.text().nullable(),
  campaigns: model.manyToMany(() => Campaign, { mappedBy: 'groves' }),
})

export const Apiary = model.define('filiera_apiary', {
  id: model.id({ prefix: 'apy' }).primaryKey(),
  name: model.text().searchable(),
  municipality: model.text(),
  province: model.text().nullable(),
  elevation_m: model.number().nullable(),
  hive_count: model.number().nullable(),
  bda_code: model.text().nullable(),
  notes: model.text().nullable(),
  campaigns: model.manyToMany(() => Campaign, { mappedBy: 'apiaries' }),
})

// Frantoio: sempre di terzi, scelto campagna per campagna.
export const Mill = model.define('filiera_mill', {
  id: model.id({ prefix: 'mill' }).primaryKey(),
  name: model.text().searchable(),
  municipality: model.text(),
  province: model.text().nullable(),
  address: model.text().nullable(),
  vat_number: model.text().nullable(),
  notes: model.text().nullable(),
  campaigns: model.hasMany(() => Campaign, { mappedBy: 'mill' }),
})

// Stabilimento di confezionamento: oggi il frantoio imbottiglia, domani il laboratorio aziendale.
export const Establishment = model.define('filiera_establishment', {
  id: model.id({ prefix: 'est' }).primaryKey(),
  name: model.text().searchable(),
  role: model.enum(['imbottigliamento', 'invasettamento', 'laboratorio']),
  municipality: model.text(),
  province: model.text().nullable(),
  address: model.text().nullable(),
  internal_code: model.text().nullable(),
  lots: model.hasMany(() => Lot, { mappedBy: 'packaging_establishment' }),
})
