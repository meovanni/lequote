import type { Entry } from './drafts'
import type { ContentSchema } from './schema'
import { fieldIndex } from './schema'

// Segnaposto dei dati aziendali nei testi ({partita iva}): li definisce la vetrina
// (client/src/data/published/tokens.ts) e arrivano qui con defaults.generated.json. La vetrina li
// sostituisce con i dati attuali; qui servono per convertire le modifiche salvate prima, dove il
// dato era scritto per esteso, così cambiandolo una volta si aggiorna ovunque.

const MIN_LENGTH = 4

/** Coppie [valore per esteso, segnaposto]: partenza, bozza e online di ogni dato, dalla più lunga. */
export function tokenPairs(entries: Entry[], schema: ContentSchema): [string, string][] {
  const fields = fieldIndex(schema)
  const pairs = schema.tokens.flatMap(({ token, key }) => {
    const known = [fields.get(key)?.defaults.shared, ...entries.filter((entry) => entry.key === key && entry.scope === 'shared').flatMap((entry) => [entry.draft, entry.published])]
    return [...new Set(known)]
      .filter((value): value is string => typeof value === 'string' && value.trim().length >= MIN_LENGTH)
      .map((value) => [value, token] as [string, string])
  })
  return pairs.sort((a, b) => b[0].length - a[0].length)
}

const replaceAll = (text: string | null, pairs: [string, string][]) =>
  text === null ? null : pairs.reduce((result, [from, to]) => result.split(from).join(to), text)

/**
 * Le modifiche ai testi con i dati aziendali convertiti in segnaposto. Una bozza che così torna
 * uguale al testo di partenza diventa null (nessuna modifica). Solo le voci cambiate.
 */
export function tokenizeEntries(entries: Entry[], schema: ContentSchema): Entry[] {
  const pairs = tokenPairs(entries, schema)
  const fields = fieldIndex(schema)
  return entries.flatMap((entry) => {
    if (entry.scope === 'shared') return []
    const field = fields.get(entry.key)
    const original = field?.defaults[entry.scope]
    const asDefault = (text: string | null) => (text !== null && text === original ? null : text)
    const draft = asDefault(replaceAll(entry.draft, pairs))
    const published = asDefault(replaceAll(entry.published, pairs))
    return draft === entry.draft && published === entry.published ? [] : [{ ...entry, draft, published }]
  })
}
