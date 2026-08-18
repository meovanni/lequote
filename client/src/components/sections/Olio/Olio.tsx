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
          <ImagePlaceholder
            label={olio.imageLabel}
            aspectRatio="1 / 1"
            variant="oliva"
            src={olio.image}
            fit="cover"
            container={false}
          />
          <ImagePlaceholder
            label={olio.imageLabelAlt}
            aspectRatio="1 / 1"
            variant="oliva"
            src={olio.imageAlt}
            fit="cover"
            container={false}
          />
        </Reveal>

        <Reveal offset={8} className={styles.text}>
          <SectionHeading title={olio.title} visible />
          <p className="body">{olio.body}</p>

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
        </Reveal>
      </div>
    </section>
  )
}
