import { z } from '@medusajs/framework/zod'
import { MAX_TEXT } from '../../../modules/contenuti/lib/drafts'

// Un testo o una foto in bozza. Chiave, lingua e forma del valore si controllano nel servizio,
// sull'elenco dei contenuti modificabili.
export const ContentDraft = z.object({
  key: z.string().min(1).max(300),
  scope: z.enum(['it', 'en', 'de', 'shared']),
  value: z.string().max(MAX_TEXT * 2).nullable(),
})

// Foto in base64 dentro il JSON: 10 MB di file sono circa 13,4 MB di testo (limite del corpo in
// middlewares.ts).
export const ContentImageUpload = z.object({
  file_base64: z.string().min(1).max(14 * 1024 * 1024),
})
