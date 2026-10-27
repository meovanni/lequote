// Codice d'ordine (es. H3E5C26): 5 caratteri dall'aspetto casuale più le ultime due cifre
// dell'anno, ricavati dal numero progressivo di Medusa. Copia del calcolo del back end
// (server/src/lib/order-code.ts), che resta la fonte: i casi di prova dei due test sono identici,
// se cambi qualcosa là cambialo anche qui.

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const BASE = ALPHABET.length
const LENGTH = 5
const SPACE = BASE ** LENGTH
// Moltiplicatore primo con SPACE (31^5) e scostamento: numeri vicini danno codici lontani.
const MULTIPLIER = 7_368_787
const OFFSET = 1_234_567

function mod(value: number): number {
  return ((value % SPACE) + SPACE) % SPACE
}

/** Prodotto modulo SPACE senza superare la precisione dei numeri JavaScript. */
function mulMod(a: number, b: number): number {
  return Number((BigInt(a) * BigInt(b)) % BigInt(SPACE))
}

/** Ultime due cifre dell'anno dell'ordine, all'ora italiana. */
export function orderYear(createdAt: Date | string): string {
  return new Intl.DateTimeFormat('it-IT', { year: '2-digit', timeZone: 'Europe/Rome' }).format(new Date(createdAt))
}

export function orderCode(displayId: number, createdAt: Date | string): string {
  let value = mod(mulMod(displayId, MULTIPLIER) + OFFSET)
  let letters = ''
  for (let i = 0; i < LENGTH; i++) {
    letters = ALPHABET[value % BASE] + letters
    value = Math.floor(value / BASE)
  }
  return letters + orderYear(createdAt)
}
