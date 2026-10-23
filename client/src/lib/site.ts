// Dati del sito usati nei meta tag. Dominio scelto il 2026-10-23; VITE_SITE_URL al build lo
// sostituisce (per esempio in una prova su un altro indirizzo), senza barra finale.
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? 'https://le-quote.it'
export const SITE_NAME = 'Le Quote'
export const DEFAULT_IMAGE = '/images/oliveto.jpg'

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`

// Gestionale (back office di Medusa): in produzione Caddy lo serve sullo stesso dominio sotto
// /app, in sviluppo gira sulla porta del back end. VITE_ADMIN_URL solo se sta altrove.
export const ADMIN_URL: string =
  import.meta.env.VITE_ADMIN_URL ?? (import.meta.env.DEV ? 'http://localhost:9000/app' : '/app')
