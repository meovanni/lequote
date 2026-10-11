import { model } from '@medusajs/framework/utils'
import type { Visibility } from '../lib/public-lot'

export type StageFieldDefinition = {
  key: string
  label: string
  type: 'text' | 'number' | 'date'
  visibility: Visibility
  required: boolean
}

// Fase configurabile per linea di prodotto (raccolta, molitura, smielatura…). Aggiungere il
// laboratorio aziendale è una nuova fase qui, non codice.
export const StageTemplate = model.define('filiera_stage_template', {
  id: model.id({ prefix: 'stt' }).primaryKey(),
  product_line: model.enum(['olio', 'miele']),
  name: model.text(),
  position: model.number(),
  description: model.text().nullable(),
  fields: model.json<StageFieldDefinition[]>(),
  active: model.boolean().default(true),
})
