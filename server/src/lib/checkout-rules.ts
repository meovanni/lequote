// Regole del checkout ricontrollate sul server alla chiusura del carrello
// (src/workflows/hooks/complete-cart-validate.ts): la vetrina le impone già, ma chi chiama le
// API direttamente non deve poterle aggirare.

export const PAY_AT_PICKUP_PROVIDER_ID = 'pp_ritiro_lequote'
export const BANK_TRANSFER_PROVIDER_ID = 'pp_bonifico_lequote'
/** Ordini del gestionale: gli incassi si registrano a mano, anche ad acconti (modulo vendite). */
export const BACKOFFICE_PROVIDER_ID = 'pp_gestionale_lequote'

/** Il pagamento del gestionale vale solo per i carrelli che il server ha costruito e firmato. */
export function backofficePaymentViolation({ providerIds, signed }: { providerIds: string[]; signed: boolean }): string | null {
  if (!providerIds.includes(BACKOFFICE_PROVIDER_ID) || signed) return null
  return 'Il pagamento del gestionale non è disponibile per gli ordini dal sito.'
}

/** Le opzioni di ritiro hanno codice "ritiro-…" (seed); tutte le altre sono spedizioni. */
export function isPickupOptionCode(code: string | null | undefined): boolean {
  return code?.startsWith('ritiro') ?? false
}

export type PaymentDeliveryChoice = {
  /** Fornitori delle sessioni di pagamento del carrello. */
  providerIds: string[]
  /** Codice del tipo di ogni opzione di consegna scelta (null se manca). */
  optionCodes: (string | null | undefined)[]
}

/** Il pagamento al ritiro vale solo se ogni consegna del carrello è un ritiro in sede. */
export function payAtPickupViolation({ providerIds, optionCodes }: PaymentDeliveryChoice): string | null {
  if (!providerIds.includes(PAY_AT_PICKUP_PROVIDER_ID)) {
    return null
  }
  const allPickup = optionCodes.length > 0 && optionCodes.every(isPickupOptionCode)
  return allPickup ? null : 'Il pagamento al ritiro è disponibile solo con il ritiro in sede.'
}
