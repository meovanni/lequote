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
          <ImagePlaceholder label={olio.imageLabel} aspectRatio="4 / 3" variant="oliva" />
          <ImagePlaceholder label={olio.imageLabelAlt} aspectRatio="4 / 3" variant="oliva" />
        </Reveal>

        <Reveal offset={8} className={styles.text}>
          <SectionHeading eyebrow={olio.eyebrow} title={olio.title} />
          <p className="body">{olio.body}</p>

          <ul className={styles.tags}>
            {olio.tags.map((tag) => (
              <li key={tag} className={`${styles.tag} body-sm`}>
                {tag}
              </li>
            ))}
          </ul>

          <p className={`${styles.note} body-sm`}>{olio.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
