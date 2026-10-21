import type { Locale } from '@/i18n/locales'
import { legalIt } from './it'
import { legalEn } from './en'
import { legalDe } from './de'
import type { LegalContent } from './types'

export { LEGAL_PAGES, LEGAL_UPDATED, type LegalPage, type LegalDocument, type LegalBlock } from './types'

export const legalByLocale: Record<Locale, LegalContent> = { it: legalIt, en: legalEn, de: legalDe }
