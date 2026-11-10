import { model } from '@medusajs/framework/utils'

// Documenti di vendita emessi dal back office: DDT (accompagnano la merce) e fatture (copie di
// cortesia: la fattura valida è quella elettronica che emette il commercialista). Numerati per
// tipo e anno senza buchi; una volta emessi non cambiano: "data" è la fotografia di cliente,
// righe e importi al momento dell'emissione. Un documento sbagliato si annulla e il numero resta.
export const SalesDocument = model
  .define('sales_document', {
    id: model.id({ prefix: 'doc' }).primaryKey(),
    kind: model.enum(['ddt', 'fattura']),
    year: model.number(),
    number: model.number(),
    issued_at: model.dateTime(),
    status: model.enum(['issued', 'canceled']).default('issued'),
    /** Chi è il cliente (P.IVA, codice fiscale o nome): le fatture differite raggruppano per questo. */
    customer_key: model.text().index('IDX_sales_document_customer_key'),
    customer_name: model.text().searchable(),
    /** Totale IVA inclusa delle fatture; null per i DDT, che non hanno prezzi. */
    total: model.bigNumber().nullable(),
    data: model.json(),
    issued_by: model.text().nullable(),
    orders: model.hasMany(() => SalesDocumentOrder, { mappedBy: 'document' }),
  })
  .indexes([{ name: 'IDX_sales_document_kind_year_number', on: ['kind', 'year', 'number'], unique: true, where: 'deleted_at IS NULL' }])
  .cascades({ delete: ['orders'] })

/** Ordini di un documento: uno per DDT, uno o più per fattura (la differita raccoglie i DDT del mese). */
export const SalesDocumentOrder = model.define('sales_document_order', {
  id: model.id({ prefix: 'doco' }).primaryKey(),
  order_id: model.text().index('IDX_sales_document_order_order_id'),
  document: model.belongsTo(() => SalesDocument, { mappedBy: 'orders' }),
})
