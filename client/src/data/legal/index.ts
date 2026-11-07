import type { Locale } from '@/i18n/locales'
import { site } from '@/data/published'
import type { LegalContent } from './types'

export { LEGAL_PAGES, LEGAL_UPDATED, type LegalPage, type LegalDocument, type LegalBlock } from './types'

// Testi di partenza in it/en/de.ts, con sopra le modifiche pubblicate dal back office.
export const legalByLocale: Record<Locale, LegalContent> = site.legalByLocale
