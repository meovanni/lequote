import { useContent, useLocale } from '@/i18n/LocaleContext'
import { sectionHref } from '@/i18n/locales'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { Logo } from '@/components/common/Logo/Logo'
import { LockIcon } from '@/components/common/icons/Icons'
import { ADMIN_URL } from '@/lib/site'
import styles from './Footer.module.css'

export function Footer() {
  const { contatti, footer, footerNavItems, ui } = useContent()
  const locale = useLocale()
  return (
    <footer id="contatti" className={styles.footer} data-surface="dark">
      <div className={styles.contact}>
        <Reveal>
          <SectionHeading title={contatti.title} align="center" />
        </Reveal>

        <div className={styles.general}>
          <a href={`mailto:${contatti.email}`} className="body">
            {contatti.email}
          </a>
          <span className="body">{contatti.phone}</span>
          <p className={`${styles.note} body-sm`}>{contatti.note}</p>
        </div>
      </div>

      <Reveal offset={20}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <Logo className={styles.brandLogo} />
            <p className={`${styles.tagline} body-sm`}>{footer.tagline}</p>
          </div>

          <nav aria-label={ui.footerNavLabel}>
            <ul className={styles.navList}>
              {footerNavItems.map((item) => (
                <li key={item.id}>
                  <a href={sectionHref(locale, item.id)} className="body-sm">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className={styles.social}>
            {footer.social.map((social) => (
              <li key={social.label}>
                <a href={social.href} className="body-sm">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bottom}>
          <p className={`${styles.legal} body-sm`}>{footer.legal}</p>
          {/* Accesso al gestionale per i titolari: discreto, fuori dalla barra dei clienti. */}
          <a href={ADMIN_URL} className={`${styles.admin} body-sm`} rel="nofollow">
            <LockIcon className={styles.adminIcon} />
            {ui.adminLink}
          </a>
        </div>
      </Reveal>

      <div className={styles.bigWordmark} aria-hidden="true">
        <Logo />
      </div>
    </footer>
  )
}
