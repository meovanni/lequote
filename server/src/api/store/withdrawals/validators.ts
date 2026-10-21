import { z } from '@medusajs/framework/zod'

// Dichiarazione di recesso dal sito: i dati che l'art. 54-bis c.2 chiede di poter indicare.
export const WithdrawalCreate = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  order_reference: z.string().trim().min(1).max(100),
  details: z.string().trim().max(2000).nullish(),
  locale: z.enum(['it', 'en', 'de']).default('it'),
  /** Campo trappola, nascosto alle persone: se è pieno, ha scritto un programma. */
  website: z.string().max(500).optional(),
})
