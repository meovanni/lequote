import type { Locale } from '@/i18n/locales'
import { storeFetch } from './client'

// Funzione di recesso online (Cod. Consumo art. 54-bis): la dichiarazione va a Medusa, che la
// registra e manda la ricevuta per email (server/src/api/store/withdrawals).

export interface WithdrawalInput {
  name: string
  email: string
  orderReference: string
  details: string
  locale: Locale
  /** Campo trappola: vuoto per le persone. */
  website: string
}

export async function submitWithdrawal(input: WithdrawalInput): Promise<{ submittedAt: Date }> {
  const { withdrawal } = await storeFetch<{ withdrawal: { submitted_at: string } }>('/store/withdrawals', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      order_reference: input.orderReference.trim(),
      details: input.details.trim() || null,
      locale: input.locale,
      ...(input.website && { website: input.website }),
    }),
  })
  return { submittedAt: new Date(withdrawal.submitted_at) }
}
