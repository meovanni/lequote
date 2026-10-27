// Codice d'ordine che vedono clienti e titolari: 7 caratteri, 5 dall'aspetto casuale più le ultime
// due cifre dell'anno (es. H3E5C26). Non si salva da nessuna parte: si ricava dal numero progressivo
// di Medusa (display_id) con una permutazione reversibile, quindi è unico e dal codice si risale
// all'ordine (modulo di recesso). Niente 0/O, 1/I/L: si confondono quando li si ricopia a mano.
//
// Lo stesso calcolo è nel sito (client/src/lib/orderCode.ts) per la pagina di conferma: i casi di
// prova dei due test sono identici, se cambi qualcosa qui cambialo anche là.

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

function inverse(value: number): number {
  let [oldR, r] = [value, SPACE]
  let [oldS, s] = [1, 0]
  while (r !== 0) {
    const q = Math.floor(oldR / r)
    ;[oldR, r] = [r, oldR - q * r]
    ;[oldS, s] = [s, oldS - q * s]
  }
  return mod(oldS)
}

const MULTIPLIER_INVERSE = inverse(MULTIPLIER)

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

const CODE = new RegExp(`^([${ALPHABET}]{${LENGTH}})(\\d{2})$`)

/** Il codice dentro ciò che scrive il cliente: una parola sola ("n. h3e5c26") o tutto il testo unito ("H3E5 C26"). */
function findCode(reference: string): RegExpExecArray | null {
  const upper = reference.toUpperCase().replace(/[#-]/g, '')
  const words = upper.split(/[^A-Z0-9]+/).filter((word) => CODE.test(word))
  if (words.length > 1) return null
  return CODE.exec(words[0] ?? upper.replace(/[^A-Z0-9]/g, ''))
}

/**
 * Il progressivo e l'anno da un codice scritto dal cliente ("h3e5c26", "n. H3E5-C26", "#H3E5C26");
 * null se non è un codice valido. L'anno va poi confrontato con quello dell'ordine trovato.
 */
export function parseOrderCode(reference: string): { displayId: number; year: string; code: string } | null {
  const match = findCode(reference)
  if (!match) return null
  const code = match[0]
  const value = [...match[1]].reduce((total, char) => total * BASE + ALPHABET.indexOf(char), 0)
  const displayId = mulMod(mod(value - OFFSET), MULTIPLIER_INVERSE)
  return displayId > 0 ? { displayId, year: match[2], code } : null
}
