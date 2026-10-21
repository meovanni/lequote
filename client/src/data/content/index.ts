import type { Locale } from '@/i18n/locales'
import { it, type Content } from './it'
import { en } from './en'
import { de } from './de'

export type { Content }

// Tutte le lingue nello stesso bundle: sono poche decine di KB di testo, e così il cambio di
// lingua non aspetta la rete.
export const contentByLocale: Record<Locale, Content> = { it, en, de }
