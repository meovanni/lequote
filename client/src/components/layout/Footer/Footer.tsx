import { contatti, footer, navItems } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { PinIcon } from '@/components/common/icons/Icons'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer id="contatti" className={styles.footer} data-surface="dark">
      <div className={styles.contact}>
        <Reveal>
          <SectionHeading title={contatti.title} align="center" />
        </Reveal>

        <div className={styles.cards}>
          {contatti.locations.map((location, index) => (
            <Reveal key={location.name} offset={index * 10} variant="scale" className={styles.card}>
              <PinIcon className={styles.pin} />
              <h3 className="display-3">{location.name}</h3>
              <p className={`${styles.place} body-sm`}>{location.place}</p>
              <p className="body">{location.address}</p>
              <a href={location.mapsHref} target="_blank" rel="noreferrer" className={`${styles.mapsLink} mono-label`}>
                Apri in Google Maps
              </a>
            </Reveal>
          ))}
        </div>

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
