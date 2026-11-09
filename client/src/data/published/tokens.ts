import { mapStrings, replaceEverywhere } from './overrides'

// Segnaposto dei dati aziendali dentro i testi: nel back office la P.IVA scritta nelle condizioni
// di vendita compare come {partita iva} e si cambia una volta sola in Azienda › Dati aziendali.
// Lo stesso elenco va al server con defaults.generated.json (per il back office e le migrazioni).

export type BusinessToken = {
  token: string
  /** Percorso del dato nei dati aziendali (business.ts), senza "business.". */
  key: string
  label: string
}

export const BUSINESS_TOKENS: readonly BusinessToken[] = [
  { token: '{ragione sociale}', key: 'SELLER.name', label: 'Ragione sociale' },
  { token: '{sede legale}', key: 'SELLER.address', label: 'Sede legale' },
  { token: '{partita iva}', key: 'SELLER.vat', label: 'Partita IVA' },
  { token: '{email}', key: 'SELLER.email', label: 'Email' },
  { token: '{pec}', key: 'SELLER.pec', label: 'PEC' },
  { token: '{telefono}', key: 'SELLER.phone', label: 'Telefono' },
]

/** Valori troppo corti per riconoscerli in un testo senza sbagliare (un "7" qualsiasi). */
const MIN_LENGTH = 4

/**
 * Coppie [valore scritto per esteso, segnaposto] per ogni valore noto di un dato (quello di
 * partenza e quelli cambiati poi), dalla più lunga: "info@le-quote.it" prima di "le-quote.it".
 */
export function tokenPairs(valuesByKey: Record<string, readonly (string | undefined)[]>): [string, string][] {
  const pairs = BUSINESS_TOKENS.flatMap(({ token, key }) =>
    [...new Set(valuesByKey[key] ?? [])]
      .filter((value): value is string => typeof value === 'string' && value.trim().length >= MIN_LENGTH)
      .map((value) => [value, token] as [string, string]),
  )
  return pairs.sort((a, b) => b[0].length - a[0].length)
}

/** Sostituisce i dati scritti per esteso con i loro segnaposto. */
export const tokenize = <T>(base: T, pairs: [string, string][]): T => replaceEverywhere(base, pairs)

/** ", telefono {telefono}": la virgola, l'etichetta (al più 40 caratteri) e il segnaposto. */
const inList = (token: string) => new RegExp(`,\\s*[^,;:{}()]{0,40}?\\{${token.slice(1, -1)}\\}`, 'g')

/**
 * Un dato lasciato vuoto (il telefono da non pubblicare) sparisce dagli elenchi insieme alla sua
 * etichetta: "PEC {pec}, telefono {telefono}." diventa "PEC ….". Altrove resta solo vuoto.
 */
function withoutEmpty<T>(base: T, current: Record<string, string>): T {
  const empty = BUSINESS_TOKENS.filter(({ key }) => !current[key]?.trim())
  if (empty.length === 0) return base
  return mapStrings(base, (text) =>
    empty.reduce((result, { token }) => result.replace(inList(token), ''), text),
  )
}

/** Sostituisce i segnaposto con i dati aziendali attuali. */
export function detokenize<T>(base: T, current: Record<string, string>): T {
  return replaceEverywhere(
    withoutEmpty(base, current),
    BUSINESS_TOKENS.map(({ token, key }) => [token, current[key] ?? ''] as const),
  )
}
