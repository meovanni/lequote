import { BANK_TRANSFER_PROVIDER_ID } from './checkout-rules'

// Regole dei lavori notturni (src/jobs): carrelli abbandonati e bonifici non pagati. Gli impegni
// corrispondenti sono scritti nelle pagine legali (privacy, condizioni di vendita).

/** Giorni da una variabile d'ambiente: intero positivo, altrimenti il valore predefinito. */
export function retentionDays(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value.trim())) return fallback
  const days = Number(value)
  return days > 0 ? days : fallback
}

export function cutoffDate(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export type OrderForPaymentCheck = {
  id: string
  status: string
  created_at: string | Date
  metadata: Record<string, unknown> | null
  payment_collections: ({ status: string; payments: ({ provider_id: string; captured_at: string | Date | null } | null)[] | null } | null)[] | null
}

/**
 * Chi ha inserito l'ordine (metadata.inserted_by): manca per gli ordini dal sito creati prima di
 * questo campo, che contano come "sito".
 */
function insertedByType(metadata: Record<string, unknown> | null): string {
  const insertedBy = metadata?.inserted_by as { type?: unknown } | undefined
  return typeof insertedBy?.type === 'string' ? insertedBy.type : 'sito'
}

/**
 * Ordini dal sito pagati con bonifico, non incassati e più vecchi del termine. Le prenotazioni
 * inserite da agenti o dal back office non si annullano da sole: si pagano anche ad acconti.
 */
export function unpaidTransfersToCancel(orders: OrderForPaymentCheck[], cutoff: Date): string[] {
  return orders
    .filter((order) => order.status !== 'canceled' && order.status !== 'completed')
    .filter((order) => insertedByType(order.metadata) === 'sito')
    .filter((order) => new Date(order.created_at) < cutoff)
    .filter((order) => {
      const payments = (order.payment_collections ?? []).flatMap((collection) => collection?.payments ?? [])
      const byTransfer = payments.some((payment) => payment?.provider_id === BANK_TRANSFER_PROVIDER_ID)
      const captured = payments.some((payment) => payment?.captured_at)
      return byTransfer && !captured
    })
    .map((order) => order.id)
}
