import { useLocation } from 'react-router'
import { contentByLocale } from '@/data/content'
import { localeFromPathname, localizePath } from '@/i18n/locales'
import { SITE_NAME } from '@/lib/site'

interface ErrorPageProps {
  notFound: boolean
}

// Pagina 404 o d'errore imprevisto. Usata anche fuori dalle rotte di lingua (ErrorBoundary di
// root), quindi ricava la lingua dal percorso invece che dal contesto.
export function ErrorPage({ notFound }: ErrorPageProps) {
  const locale = localeFromPathname(useLocation().pathname)
  const { ui } = contentByLocale[locale]
  const title = notFound ? ui.notFoundTitle : ui.errorTitle
  return (
    <div className="error-page" data-surface="light">
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="robots" content="noindex" />
      <h1 className="title-mark display-3">{title}</h1>
      <p className="body">{notFound ? ui.notFoundBody : ui.errorBody}</p>
      <a href={localizePath(locale, '/')} className="body">
        {ui.backHome}
      </a>
    </div>
  )
}
