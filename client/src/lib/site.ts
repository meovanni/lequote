// Dati del sito usati nei meta tag. Il dominio non è ancora stato scelto (docs/plan.md, dati
// mancanti): si imposta al build con VITE_SITE_URL, senza barra finale.
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? 'https://[dominio-da-confermare]'
export const SITE_NAME = 'Le Quote'
export const DEFAULT_IMAGE = '/images/oliveto.jpg'

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`

// Gestionale (back office di Medusa): in produzione Caddy lo serve sullo stesso dominio sotto
// /app, in sviluppo gira sulla porta del back end. VITE_ADMIN_URL solo se sta altrove.
export const ADMIN_URL: string =
  import.meta.env.VITE_ADMIN_URL ?? (import.meta.env.DEV ? 'http://localhost:9000/app' : '/app')
