import { footer, navItems } from '@/data/content'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer} data-surface="dark">
      <Reveal offset={20}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <Logo className={styles.brandLogo} />
            <p className={`${styles.tagline} body-sm`}>{footer.tagline}</p>
          </div>

          <nav aria-label="Menu footer">
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="body-sm">
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

        <p className={`${styles.legal} body-sm`}>{footer.legal}</p>
      </Reveal>

      <div className={styles.bigWordmark} aria-hidden="true">
        <Logo />
      </div>
    </footer>
  )
}
