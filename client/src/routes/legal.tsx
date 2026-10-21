import { useLocation } from 'react-router'
import { LEGAL_PAGES, legalByLocale, type LegalPage } from '@/data/legal'
import { localeFromPathname, stripLocale } from '@/i18n/locales'
import { pageMeta } from '@/i18n/seo'
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'
import { ErrorPage } from '@/components/common/ErrorPage/ErrorPage'
import type { Route } from './+types/legal'

// Un modulo per le quattro pagine legali (routes.ts): quale documento mostrare lo dice il percorso.
function legalPage(pathname: string): LegalPage | null {
  const slug = stripLocale(pathname).replace(/^\/|\/$/g, '')
  return (LEGAL_PAGES as readonly string[]).includes(slug) ? (slug as LegalPage) : null
}

export function meta({ location }: Route.MetaArgs) {
  const page = legalPage(location.pathname)
  if (!page) return []
  const locale = localeFromPathname(location.pathname)
  const document = legalByLocale[locale].documents[page]
  return pageMeta({ locale, path: `/${page}`, title: `${document.title} | Le Quote`, description: document.metaDescription })
}

export default function LegalRoute() {
  const page = legalPage(useLocation().pathname)
  return page ? <LegalDocumentPage page={page} /> : <ErrorPage notFound />
}
