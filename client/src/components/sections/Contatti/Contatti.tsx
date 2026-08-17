import { contatti } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { PinIcon } from '@/components/common/icons/Icons'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Contatti.module.css'

export function Contatti() {
  return (
    <section id="contatti" data-surface="light" className={styles.section}>
      <div className={styles.inner}>
        <Reveal>
          <SectionHeading eyebrow={contatti.eyebrow} title={contatti.title} align="center" />
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
    </section>
  )
}
