import type { Locale } from '@/i18n/locales'
import { site, type Content } from '@/data/published'

export type { Content }

// Tutte le lingue nello stesso bundle: sono poche decine di KB di testo, e così il cambio di
// lingua non aspetta la rete. Testi di partenza in it/en/de.ts, con sopra le modifiche
// pubblicate dal back office (data/published).
export const contentByLocale: Record<Locale, Content> = site.contentByLocale
