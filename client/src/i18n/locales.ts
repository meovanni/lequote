// Lingue del sito (ADR 0003): italiano alla radice, inglese e tedesco sotto un prefisso.
export const LOCALES = ['it', 'en', 'de'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'it'

const PREFIX: Record<Locale, string> = { it: '', en: '/en', de: '/de' }

export const HTML_LANG: Record<Locale, string> = {
  it: 'it',
  en: 'en',
  de: 'de',
}
export const OG_LOCALE: Record<Locale, string> = {
  it: 'it_IT',
  en: 'en_GB',
  de: 'de_DE',
}
export const INTL_LOCALE: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-IE',
  de: 'de-DE',
}

export function isLocale(value: string | undefined): value is Locale {
  return (LOCALES as readonly string[]).includes(value ?? '')
}

export function localeFromPathname(pathname: string): Locale {
  const first = pathname.split('/')[1]
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE
}

/** Percorso nella lingua data: `localizePath('en', '/')` → `/en/`, `localizePath('it', '/lotto/L1')` → `/lotto/L1`. */
export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${PREFIX[locale]}${clean}`
}

/** Toglie il prefisso di lingua: `/de/lotto/L1` → `/lotto/L1`. */
export function stripLocale(pathname: string): string {
  const locale = localeFromPathname(pathname)
  const rest = pathname.slice(PREFIX[locale].length)
  return rest === '' ? '/' : rest
}

/** Link a una sezione della home, valido da qualsiasi pagina: `/en/#olio`. */
export function sectionHref(locale: Locale, sectionId: string): string {
  return `${localizePath(locale, '/')}#${sectionId}`
}
