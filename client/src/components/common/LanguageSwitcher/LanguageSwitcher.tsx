import { Link, useLocation } from 'react-router'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { HTML_LANG, LOCALES, localizePath, stripLocale } from '@/i18n/locales'
import styles from './LanguageSwitcher.module.css'

interface LanguageSwitcherProps {
  className?: string
  onNavigate?: () => void
}

// Porta alla stessa pagina nell'altra lingua. Le sigle sono brevi per la barra; il nome intero
// della lingua resta nell'etichetta accessibile, scritto nella lingua di destinazione.
export function LanguageSwitcher({ className, onNavigate }: LanguageSwitcherProps) {
  const { ui } = useContent()
  const current = useLocale()
  const { pathname } = useLocation()
  const path = stripLocale(pathname)

  return (
    <nav aria-label={ui.languageLabel} className={[styles.switcher, className].filter(Boolean).join(' ')}>
      <ul className={styles.list}>
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              to={localizePath(locale, path)}
              hrefLang={HTML_LANG[locale]}
              lang={HTML_LANG[locale]}
              aria-label={ui.languageNames[locale]}
              aria-current={locale === current ? 'true' : undefined}
              className={`${styles.link} mono-label`}
              onClick={onNavigate}
            >
              {locale.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
