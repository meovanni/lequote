/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dominio pubblico del sito, senza barra finale (meta tag). */
  readonly VITE_SITE_URL?: string
  /** Indirizzo del back end, solo se non è sullo stesso dominio della vetrina. */
  readonly VITE_MEDUSA_URL?: string
  /** Chiave pubblica della vetrina (Medusa), scritta da "npm run storefront-env". */
  readonly VITE_MEDUSA_PUBLISHABLE_KEY?: string
  /** Indirizzo del gestionale, solo se non è /app sullo stesso dominio. */
  readonly VITE_ADMIN_URL?: string
}
