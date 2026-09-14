import { olio } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Olio.module.css'

export function Olio() {
  return (
    <section id="olio" data-surface="light" className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="sideLeft" className={styles.images}>
          <ImagePlaceholder label={olio.imageLabel} aspectRatio="3 / 5" variant="oliva" src={olio.image} fit="cover" />
          <ImagePlaceholder
            label={olio.imageLabelAlt}
            aspectRatio="3 / 5"
            variant="oliva"
            src={olio.imageAlt}
            fit="cover"
          />
        </Reveal>

        <div className={styles.text}>
          <Reveal offset={8}>
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
