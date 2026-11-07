// Modifiche ai testi fatte nel back office (sezione Contenuti): chiavi a percorso puntato
// ("hero.title", "domande.topics.0.items.2.answer") con il nuovo testo. Si applicano solo a
// testi che esistono già nei contenuti di partenza: una chiave sconosciuta o che punta a una
// funzione, a un numero o a un elenco si ignora, così una modifica non può rompere la struttura.

export type Overrides = Readonly<Record<string, string>>

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Tutti i testi di un oggetto di contenuti, per percorso. Funzioni e numeri restano fuori. */
export function flattenStrings(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return prefix ? { [prefix]: value } : {}
  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : isPlainObject(value)
      ? Object.entries(value)
      : []
  return Object.assign({}, ...entries.map(([key, item]) => flattenStrings(item, prefix ? `${prefix}.${key}` : key)))
}

function mapStrings<T>(value: T, change: (text: string, path: string) => string, path = ''): T {
  const child = (key: string) => (path ? `${path}.${key}` : key)
  if (typeof value === 'string') return change(value, path) as T
  if (Array.isArray(value)) return value.map((item, index) => mapStrings(item, change, child(String(index)))) as T
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapStrings(item, change, child(key))])) as T
  }
  return value
}

/** Copia dei contenuti con i testi sostituiti dove c'è una modifica; l'originale non cambia. */
export function applyOverrides<T>(base: T, overrides: Overrides): T {
  if (Object.keys(overrides).length === 0) return base
  return mapStrings(base, (text, path) => (Object.hasOwn(overrides, path) ? overrides[path] : text))
}

/** Sostituisce ovunque un testo con un altro (per i dati aziendali citati dentro i testi legali). */
export function replaceEverywhere<T>(base: T, pairs: readonly (readonly [string, string])[]): T {
  const active = pairs.filter(([from, to]) => from !== '' && from !== to)
  if (active.length === 0) return base
  return mapStrings(base, (text) => active.reduce((result, [from, to]) => result.split(from).join(to), text))
}

/** Le chiavi che iniziano con "prefisso." senza il prefisso. */
export function withinPrefix(overrides: Overrides, prefix: string): Overrides {
  const start = `${prefix}.`
  return Object.fromEntries(
    Object.entries(overrides)
      .filter(([key]) => key.startsWith(start))
      .map(([key, value]) => [key.slice(start.length), value]),
  )
}
