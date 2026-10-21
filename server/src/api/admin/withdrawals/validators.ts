import { z } from '@medusajs/framework/zod'

// Il contenuto della dichiarazione non si modifica: si aggiornano solo stato e note interne.
export const WithdrawalUpdate = z.object({
  handled: z.boolean().optional(),
  notes: z.string().trim().max(2000).nullish(),
})
