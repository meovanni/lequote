import { absoluteUrl, DEFAULT_IMAGE, SITE_NAME } from '@/lib/site'
import { LOCALES, HTML_LANG, OG_LOCALE, DEFAULT_LOCALE, localizePath, type Locale } from './locales'

interface PageMeta {
  locale: Locale
  /** Percorso senza prefisso di lingua, uguale in tutte le lingue: `/`, `/lotto/L1`. */
  path: string
  title: string
  description: string
  image?: string
}

// Meta comuni a ogni pagina pubblica: canonical, alternative di lingua (hreflang), Open Graph.
export function pageMeta({ locale, path, title, description, image = DEFAULT_IMAGE }: PageMeta) {
  const url = absoluteUrl(localizePath(locale, path))
  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    ...LOCALES.map((alt) => ({
      tagName: 'link',
      rel: 'alternate',
      hrefLang: HTML_LANG[alt],
      href: absoluteUrl(localizePath(alt, path)),
    })),
    {
      tagName: 'link',
      rel: 'alternate',
      hrefLang: 'x-default',
      href: absoluteUrl(localizePath(DEFAULT_LOCALE, path)),
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: absoluteUrl(image) },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: OG_LOCALE[locale] },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: absoluteUrl(image) },
  ]
}

/** Pagine private (carrello, conferma d'ordine): niente indicizzazione né anteprime social. */
export function privatePageMeta(title: string, description: string) {
  return [{ title }, { name: 'description', content: description }, { name: 'robots', content: 'noindex, nofollow' }]
}
