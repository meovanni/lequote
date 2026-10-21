// Accesso alla Store API di Medusa dal browser. In sviluppo le chiamate /store passano dal proxy
// di Vite (vite.config.ts), in produzione da Caddy sullo stesso dominio: niente CORS e nessun
// indirizzo del back end nel codice. VITE_MEDUSA_URL serve solo se il back end sta altrove.
const BASE_URL: string = import.meta.env.VITE_MEDUSA_URL ?? ''
const PUBLISHABLE_KEY: string | undefined = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY

export class StoreApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'StoreApiError'
    this.status = status
  }
}

export async function storeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!PUBLISHABLE_KEY) {
    throw new StoreApiError('VITE_MEDUSA_PUBLISHABLE_KEY mancante: vedi README, "npm run storefront-env".', 0)
  }
  const headers = new Headers(init.headers)
  headers.set('x-publishable-api-key', PUBLISHABLE_KEY)
  if (init.body) headers.set('content-type', 'application/json')

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!response.ok) {
    // Il messaggio di Medusa resta nei log del browser; all'utente arriva un testo tradotto.
    const detail = await response.text().catch(() => '')
    throw new StoreApiError(`Store API ${response.status} su ${path}: ${detail.slice(0, 200)}`, response.status)
  }
  return (await response.json()) as T
}
