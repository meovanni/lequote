import { useContent } from '@/i18n/LocaleContext'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import styles from './Olio.module.css'

export function Olio() {
  const { olio } = useContent()
  return (
    <section id="olio" data-surface="light-alt" className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="sideLeft" className={styles.images}>
          <ImagePlaceholder className={styles.bottle} label={olio.imageLabel} aspectRatio="4 / 5" src={olio.image || undefined} />
        </Reveal>

        <div className={styles.text}>
          <Reveal offset={8}>
            <span className={`${styles.elevation} specimen-tag specimen`}>{olio.elevation}</span>
            <SectionHeading title={olio.title} visible />
          </Reveal>
          <Reveal offset={14}>
            <p className="body-lead">{olio.body}</p>
          </Reveal>

          <ul className={styles.varieties}>
            {olio.varieties.map((variety, index) => (
              <li key={variety.name}>
                <Reveal offset={index * 8} variant="up" className={styles.variety}>
                  <span className="display-3">{variety.name}</span>
                  <span className={`${styles.varietyNote} body-sm`}>{variety.note}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
