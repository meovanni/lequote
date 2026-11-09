import type { ContentField, Locale, Scope } from './schema'

// Regole delle modifiche ai contenuti, senza database: cosa si può salvare, cosa va online
// premendo "Pubblica", quante modifiche aspettano.

export type Entry = { key: string; scope: Scope; draft: string | null; published: string | null }

export type PublishedContent = {
  texts: Record<Locale, Record<string, string>>
  shared: Record<string, string>
}

export const MAX_TEXT = 10_000

/** Indirizzo di una foto caricata dalla sezione Contenuti (lib/image-store.ts). */
export const IMAGE_URL = /^\/contenuti\/immagini\/[0-9a-f-]{36}\.(jpg|png|webp)$/

const LINK = /^(https?:\/\/[^\s]+|mailto:[^\s]+|#[\w-]*)$/

/** Campi che seguono un altro: la foto piccola dell'apertura è la stessa della grande. */
export const LINKED: Record<string, string[]> = { 'hero.poster': ['hero.posterSmall'] }

export type Change = { ok: true; value: string | null } | { ok: false; error: string }

/**
 * Il valore da salvare in bozza, o il motivo per cui non si può. null o uguale al testo di
 * partenza: nessuna modifica, vale il testo del codice. Un testo svuotato resta vuoto sul sito
 * (il telefono da non pubblicare); una foto tolta torna invece quella di partenza.
 */
export function normalizeChange(field: ContentField | undefined, scope: Scope, value: string | null): Change {
  if (!field) return { ok: false, error: 'Questo contenuto non esiste.' }
  if (field.locked) return { ok: false, error: field.locked }
  const scopeOk = field.scope === 'shared' ? scope === 'shared' : scope !== 'shared'
  if (!scopeOk) return { ok: false, error: 'Lingua non valida per questo contenuto.' }

  if (value === null) return { ok: true, value: null }
  const text = field.kind === 'long' ? value.replace(/\r\n/g, '\n').trim() : value.replace(/\s+/g, ' ').trim()
  if (text === (field.defaults[scope] ?? '')) return { ok: true, value: null }
  if (text === '') return field.kind === 'image' ? { ok: true, value: null } : { ok: true, value: '' }
  if (text.length > MAX_TEXT) return { ok: false, error: `Il testo supera ${MAX_TEXT} caratteri.` }
  if (field.kind === 'image' && !IMAGE_URL.test(text)) return { ok: false, error: 'Carica la foto dal pulsante della sezione.' }
  if (field.kind === 'link' && !LINK.test(text)) {
    return { ok: false, error: 'Scrivi un indirizzo completo, per esempio https://www.instagram.com/lequote.' }
  }
  return { ok: true, value: text }
}

/** Le modifiche in bozza come le legge la vetrina (client/src/data/published). */
export function toPublished(entries: Entry[]): PublishedContent {
  const result: PublishedContent = { texts: { it: {}, en: {}, de: {} }, shared: {} }
  for (const entry of entries) {
    if (entry.draft === null) continue
    const target = entry.scope === 'shared' ? result.shared : result.texts[entry.scope]
    target[entry.key] = entry.draft
    for (const linked of LINKED[entry.key] ?? []) target[linked] = entry.draft
  }
  return result
}

export const isPending = (entry: Entry) => entry.draft !== entry.published

export const pendingCount = (entries: Entry[]) => entries.filter(isPending).length

/** Valori online delle foto e dei dati aziendali (per esempio le coordinate del bonifico nelle email). */
export function publishedShared(entries: Entry[]): Record<string, string> {
  return Object.fromEntries(
    entries.filter((entry) => entry.scope === 'shared' && entry.published !== null).map((entry) => [entry.key, entry.published as string]),
  )
}
