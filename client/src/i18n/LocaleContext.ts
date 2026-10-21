import { createContext, use } from 'react'
import { DEFAULT_LOCALE, type Locale } from './locales'
import { contentByLocale } from '@/data/content'

// La lingua la imposta la rotta di lingua (routes/locale.tsx); fuori da una rotta, per esempio
// nei test dei componenti, vale l'italiano.
export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function useLocale(): Locale {
  return use(LocaleContext)
}

export function useContent() {
  return contentByLocale[use(LocaleContext)]
}
