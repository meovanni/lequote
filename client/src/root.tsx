import type { ReactNode } from 'react'
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router'

// Build con assi wght + opsz: senza opsz i titoli grandi usano la taglia ottica da testo, più pesante.
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/instrument-sans'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'

import '@/styles/tokens.css'
import '@/styles/typography.css'
import '@/styles/global.css'

import { SITE_NAME } from '@/lib/site'
import { HTML_LANG, localeFromPathname } from '@/i18n/locales'
import { ErrorPage } from '@/components/common/ErrorPage/ErrorPage'
import { useSectionLinks } from '@/hooks/useSectionLinks'
import type { Route } from './+types/root'

const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  description:
    "Azienda agricola familiare tra la Riserva del Borsacchio e Cerchio (AQ): olio extravergine d'oliva e miele, dal mare alla montagna abruzzese.",
  email: 'info@le-quote.it',
  areaServed: [
    { '@type': 'Place', name: 'Roseto degli Abruzzi (TE)' },
    { '@type': 'Place', name: 'Cerchio (AQ)' },
  ],
}

export const links: Route.LinksFunction = () => [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]

export function Layout({ children }: { children: ReactNode }) {
  const locale = localeFromPathname(useLocation().pathname)
  return (
    <html lang={HTML_LANG[locale]}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          // Dati statici scritti qui sopra, nessun input esterno.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  useSectionLinks()
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <main>
      <ErrorPage notFound={isRouteErrorResponse(error) && error.status === 404} />
    </main>
  )
}
