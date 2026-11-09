import { LOCALES, type Locale } from '@/i18n/locales'
import { it } from '@/data/content/it'
import { en } from '@/data/content/en'
import { de } from '@/data/content/de'
import { legalIt } from '@/data/legal/it'
import { legalEn } from '@/data/legal/en'
import { legalDe } from '@/data/legal/de'
import type { LegalContent } from '@/data/legal/types'
import * as businessDefaults from '@/data/business'
import { applyOverrides, flattenStrings, withinPrefix, type Overrides } from './overrides'
import { detokenize, tokenPairs, tokenize } from './tokens'

// Contenuti del sito come li vede il visitatore: i testi di partenza (content/, legal/, business.ts)
// con sopra le modifiche pubblicate dal back office. Il back office, premendo "Pubblica", scrive
// published.generated.json e rigenera le pagine statiche; senza il file valgono i testi di partenza.

export type PublishedContent = {
  /** Testi per lingua: "hero.title", "legal.documents.privacy.sections.0.heading". */
  texts: Partial<Record<Locale, Overrides>>
  /** Uguali in ogni lingua: foto ("hero.poster") e dati aziendali ("business.SELLER.vat"). */
  shared: Overrides
}

const EMPTY: PublishedContent = { texts: {}, shared: {} }

const files = import.meta.glob<PublishedContent>('./published.generated.json', { eager: true, import: 'default' })
const published: PublishedContent = files['./published.generated.json'] ?? EMPTY

export type Content = typeof it
export type Business = typeof businessDefaults

const BASE_CONTENT: Record<Locale, Content> = { it, en, de }
const BASE_LEGAL: Record<Locale, LegalContent> = { it: legalIt, en: legalEn, de: legalDe }

export function resolvePublished(source: PublishedContent) {
  const business = applyOverrides({ ...businessDefaults }, withinPrefix(source.shared, 'business'))
  // I dati aziendali compaiono anche dentro i testi (sede, P.IVA, email nelle pagine legali e
  // nelle risposte). Ogni testo passa per i segnaposto ({partita iva}): il valore di partenza o
  // quello attuale scritto per esteso diventa segnaposto, e il segnaposto diventa il valore attuale.
  const before = flattenStrings({ ...businessDefaults })
  const after = flattenStrings(business)
  const pairs = tokenPairs(Object.fromEntries(Object.keys(before).map((key) => [key, [before[key], after[key]]])))
  const withBusiness = <T>(texts: T): T => detokenize(tokenize(texts, pairs), after)

  const forLocale = (locale: Locale) => {
    const overrides = { ...source.shared, ...source.texts[locale] }
    return {
      content: withBusiness(applyOverrides(BASE_CONTENT[locale], overrides)),
      legal: withBusiness(applyOverrides(BASE_LEGAL[locale], withinPrefix(overrides, 'legal'))),
    }
  }
  const resolved = Object.fromEntries(LOCALES.map((locale) => [locale, forLocale(locale)])) as Record<
    Locale,
    ReturnType<typeof forLocale>
  >

  return {
    business,
    contentByLocale: Object.fromEntries(LOCALES.map((locale) => [locale, resolved[locale].content])) as Record<Locale, Content>,
    legalByLocale: Object.fromEntries(LOCALES.map((locale) => [locale, resolved[locale].legal])) as Record<Locale, LegalContent>,
  }
}

export const site = resolvePublished(published)
