import { Outlet, useLocation } from 'react-router'
import { LocaleContext } from '@/i18n/LocaleContext'
import { localeFromPathname } from '@/i18n/locales'
import { contentByLocale } from '@/data/content'
import { Nav } from '@/components/layout/Nav/Nav'
import { Footer } from '@/components/layout/Footer/Footer'
import { CartProvider } from '@/cart/CartProvider'

// Cornice di ogni pagina pubblica: lingua del percorso, carrello, barra, contenuto, footer.
export default function LocaleLayout() {
  const locale = localeFromPathname(useLocation().pathname)
  return (
    <LocaleContext value={locale}>
      <CartProvider>
        <a href="#contenuto" className="skip-link mono-label">
          {contentByLocale[locale].ui.skipLink}
        </a>
        <Nav />
        <main id="contenuto">
          <Outlet />
        </main>
        <Footer />
      </CartProvider>
    </LocaleContext>
  )
}
