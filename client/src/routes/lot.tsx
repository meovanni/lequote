import { contentByLocale } from '@/data/content'
import { localeFromPathname } from '@/i18n/locales'
import { pageMeta } from '@/i18n/seo'
import { parseLotCode } from '@/lib/lotCode'
import { LotPage } from '@/components/lot/LotPage'
import type { Route } from './+types/lot'

// Non prerenderizzata: i lotti sono dati del back office. Il sito statico la serve dal fallback
// (__spa-fallback.html) e il contenuto si legge da Medusa nel browser.
export function meta({ location, params }: Route.MetaArgs) {
  const locale = localeFromPathname(location.pathname)
  const { lotUi } = contentByLocale[locale]
  const parsed = parseLotCode(params.codice ?? '')
  const code = parsed.ok ? parsed.code : (params.codice ?? '')
  return pageMeta({ locale, path: `/lotto/${code}`, title: lotUi.metaTitle(code), description: lotUi.metaDescription })
}

export default function LotRoute({ params }: Route.ComponentProps) {
  return <LotPage rawCode={params.codice ?? ''} />
}
