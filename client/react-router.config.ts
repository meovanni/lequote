import type { Config } from '@react-router/dev/config'
import { LOCALES, localizePath } from './src/i18n/locales.ts'
import { PRODUCT_HANDLES } from './src/data/content/handles.ts'
import { LEGAL_PAGES } from './src/data/legal/types.ts'

// Sito statico (ADR 0003): nessun server per la vetrina. Le pagine pubbliche diventano HTML al
// build; prezzi, carrello, checkout e lotti si leggono da Medusa nel browser.
// Carrello, conferma e analisi sono gusci statici: il contenuto si legge da Medusa nel browser.
const PUBLIC_PATHS = [
  '/',
  ...PRODUCT_HANDLES.map((handle) => `/prodotti/${handle}`),
  '/carrello',
  '/ordine',
  '/analisi',
  ...LEGAL_PAGES.map((page) => `/${page}`),
]

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: LOCALES.flatMap((locale) => PUBLIC_PATHS.map((path) => localizePath(locale, path))),
} satisfies Config
