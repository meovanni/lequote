// Copia di client/src/lib/lotCode.ts: vetrina e back end devono accettare gli stessi codici.
// Se cambi la regola, cambiala in entrambi i file (i test sono gli stessi).
/**
 * Codice lotto come stampato in etichetta: "L" seguita dall'identificativo
 * (D.Lgs. 231/2017, art. 17). Il visitatore può digitarlo con spazi, in minuscolo, senza la L
 * iniziale o con un separatore dopo la L ("L-2026"): lo riportiamo alla forma canonica.
 *
 * Convenzione (da rispettare nella numerazione dei lotti, Fase 2): il corpo del codice non
 * inizia mai con la lettera L, così una L iniziale è sempre il prefisso.
 */
export type LotCodeResult = { ok: true; code: string } | { ok: false; reason: 'empty' | 'format' }

// Corpo: 3-20 caratteri; inizia e finisce con un alfanumerico; "-" o "." solo singoli e interni.
const LOT_BODY = /^[A-Z0-9](?:[A-Z0-9]|[.-](?=[A-Z0-9])){1,18}[A-Z0-9]$/

export function parseLotCode(input: string): LotCodeResult {
  const compact = input.replace(/\s+/g, '').toUpperCase()
  if (compact === '') return { ok: false, reason: 'empty' }

  const body = compact.startsWith('L') ? compact.slice(1).replace(/^[.-]/, '') : compact
  if (!LOT_BODY.test(body)) return { ok: false, reason: 'format' }

  return { ok: true, code: `L${body}` }
}
