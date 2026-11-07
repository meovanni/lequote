import { model } from '@medusajs/framework/utils'

// Ogni pressione di "Pubblica": le modifiche in bozza vanno nella vetrina, che rigenera le pagine.
export const ContentPublication = model.define('content_publication', {
  id: model.id({ prefix: 'cpub' }).primaryKey(),
  status: model.enum(['running', 'done', 'failed']),
  /** Quante modifiche c'erano da pubblicare. */
  changes: model.number(),
  finished_at: model.dateTime().nullable(),
  error: model.text().nullable(),
})
