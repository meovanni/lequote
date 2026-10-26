import { model } from '@medusajs/framework/utils'

// Quantità fisica per SKU (lib/formats.ts): millilitri o grammi per lo sfuso, pezzi per i formati.
export const StockCount = model.define('stock_count', {
  id: model.id({ prefix: 'stk' }).primaryKey(),
  sku: model.text().unique(),
  quantity: model.number().default(0),
})

// Ogni variazione, con chi l'ha fatta e perché: rettifiche a mano, confezionamenti, consegne e
// loro annullamenti. Una consegna si annulla rimettendo le stesse variazioni con il segno opposto.
export const StockMovement = model.define('stock_movement', {
  id: model.id({ prefix: 'stkm' }).primaryKey(),
  sku: model.text(),
  delta: model.number(),
  kind: model.enum(['rettifica', 'confezionamento', 'consegna', 'annullo_consegna']),
  order_id: model.text().index('IDX_stock_movement_order_id').nullable(),
  actor_name: model.text().nullable(),
  note: model.text().nullable(),
})
