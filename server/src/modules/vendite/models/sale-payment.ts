import { model } from '@medusajs/framework/utils'

// Incasso registrato a mano su un ordine (acconto o saldo): contanti, bonifico, assegno, carta.
// Vale per le prenotazioni degli agenti come per gli ordini del sito; quando l'ordine è saldato il
// pagamento di Medusa risulta incassato.
export const SalePayment = model.define('sale_payment', {
  id: model.id({ prefix: 'spay' }).primaryKey(),
  order_id: model.text().index('IDX_sale_payment_order_id'),
  amount: model.bigNumber(),
  method: model.enum(['contanti', 'bonifico', 'assegno', 'carta', 'altro']),
  paid_at: model.dateTime(),
  recorded_by_type: model.enum(['admin', 'agente']),
  recorded_by_id: model.text(),
  recorded_by_name: model.text(),
  notes: model.text().nullable(),
})
