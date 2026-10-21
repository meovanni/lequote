import { model } from '@medusajs/framework/utils'

// Dichiarazione di recesso inviata dal sito (art. 54-bis Cod. Consumo). Si conserva così come è
// arrivata: è la prova di cosa ha dichiarato il cliente e quando.
export const Withdrawal = model.define('withdrawal', {
  id: model.id({ prefix: 'wdr' }).primaryKey(),
  name: model.text().searchable(),
  email: model.text().searchable(),
  /** Riferimento all'ordine come l'ha scritto il cliente. */
  order_reference: model.text(),
  /** Ordine riconosciuto in automatico (numero ed email corrispondono), se c'è. */
  order_id: model.text().nullable(),
  details: model.text().nullable(),
  locale: model.text(),
  submitted_at: model.dateTime(),
  handled_at: model.dateTime().nullable(),
  notes: model.text().nullable(),
})
