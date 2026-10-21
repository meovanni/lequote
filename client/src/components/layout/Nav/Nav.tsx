import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { it } from '@/data/content/it'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath, sectionHref } from '@/i18n/locales'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher/LanguageSwitcher'
import { useActiveSection } from '@/hooks/useActiveSection'
import { Link } from 'react-router'
import { BagIcon, CloseIcon, MenuIcon } from '@/components/common/icons/Icons'
import { useCart } from '@/cart/CartContext'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Nav.module.css'

// Fuori dal componente: un array nuovo a ogni render ricreava l'IntersectionObserver di
// useActiveSection (dipendenza dell'effetto) a ogni aggiornamento della barra. Gli id delle
// sezioni sono gli stessi in ogni lingua.
const SECTION_IDS = it.navItems.map((item) => item.id)

interface IndicatorRect {
  left: number
  width: number
}

export function Nav() {
  const { navItems, ui, cartUi } = useContent()
  const { cart } = useCart()
  const cartCount = cart?.itemCount ?? 0
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null)
  const activeId = useActiveSection(SECTION_IDS)
  const linksWrapRef = useRef<HTMLElement | null>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const container = linksWrapRef.current
      const active = linkRefs.current[activeId]
      if (!container || !active) {
        setIndicator(null)
        return
      }
      const containerRect = container.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      setIndicator({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeId])

  return (
    <>
      <header className={[styles.nav, isScrolled ? styles.navScrolled : ''].filter(Boolean).join(' ')}>
        <div className={styles.inner}>
          <a href={sectionHref(locale, 'hero')} className={styles.wordmark}>
            <Logo className={styles.wordmarkLogo} />
          </a>

          <nav aria-label={ui.mainNavLabel} className={styles.linksWrap} ref={linksWrapRef}>
            {indicator && (
              <span
                aria-hidden="true"
                className={styles.indicator}
                style={{
                  transform: `translateX(${indicator.left}px)`,
                  width: indicator.width,
                }}
              />
            )}
            <ul className={styles.links}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    ref={(el) => {
                      linkRefs.current[item.id] = el
                    }}
                    href={sectionHref(locale, item.id)}
                    className={[styles.link, 'mono-label', activeId === item.id ? styles.linkActive : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <LanguageSwitcher className={styles.languages} />

          <Link to={localizePath(locale, '/carrello')} className={styles.cart} aria-label={cartUi.navLabel(cartCount)}>
            <BagIcon />
            {cartCount > 0 && (
              <span className={`${styles.cartCount} mono-figure`} aria-hidden="true">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            aria-label={isOpen ? ui.menuClose : ui.menuOpen}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Fuori dall'header: l'header ha backdrop-filter, che diventerebbe
          containing block per questo pannello fixed e ne romperebbe inset:0 */}
      <div className={[styles.overlay, isOpen ? styles.overlayOpen : ''].filter(Boolean).join(' ')}>
        <ul className={styles.overlayLinks}>
          {navItems.map((item) => (
            <li key={item.id}>
              <a href={sectionHref(locale, item.id)} className="display-3" onClick={() => setIsOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <LanguageSwitcher className={styles.overlayLanguages} onNavigate={() => setIsOpen(false)} />
      </div>
    </>
  )
}
