import { contentByLocale } from '@/data/content'
import { localeFromPathname } from '@/i18n/locales'
import { pageMeta } from '@/i18n/seo'
import { AnalysesPage } from '@/components/analyses/AnalysesPage'
import type { Route } from './+types/analyses'

// Guscio prerenderizzato: i valori dei referti si leggono da Medusa nel browser.
export function meta({ location }: Route.MetaArgs) {
  const locale = localeFromPathname(location.pathname)
  const { analysisUi } = contentByLocale[locale]
  return pageMeta({ locale, path: '/analisi', title: analysisUi.metaTitle, description: analysisUi.metaDescription })
}

export default function AnalysesRoute() {
  return <AnalysesPage />
}
