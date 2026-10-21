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

// Tipologia di fornitore (frantoio, imbottigliamento, packaging, …): i titolari ne creano di
// nuove dal back office. Quelle con codice sono di sistema: i menu del back office le usano per
// proporre il frantoio della campagna e lo stabilimento di confezionamento del lotto.
export const SupplierType = model.define('filiera_supplier_type', {
  id: model.id({ prefix: 'sty' }).primaryKey(),
  name: model.text().unique().searchable(),
  code: model.text().nullable(),
  suppliers: model.manyToMany(() => Supplier, { mappedBy: 'types' }),
})

// Fornitore: frantoio (sempre di terzi, scelto campagna per campagna), stabilimento di
// confezionamento, laboratorio, packaging. Può avere più tipologie: oggi il frantoio imbottiglia.
export const Supplier = model.define('filiera_supplier', {
  id: model.id({ prefix: 'sup' }).primaryKey(),
  name: model.text().searchable(),
  municipality: model.text(),
  province: model.text().nullable(),
  address: model.text().nullable(),
  vat_number: model.text().nullable(),
  internal_code: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  notes: model.text().nullable(),
  types: model.manyToMany(() => SupplierType, { mappedBy: 'suppliers' }),
  milled_campaigns: model.hasMany(() => Campaign, { mappedBy: 'mill' }),
  packaged_lots: model.hasMany(() => Lot, { mappedBy: 'packaging_establishment' }),
})
