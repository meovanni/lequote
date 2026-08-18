import { chiSiamo } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './ChiSiamo.module.css'

export function ChiSiamo() {
  return (
    <section id="chi-siamo" data-surface="light-alt" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.text}>
          <SectionHeading title={chiSiamo.title} />
          <div className={styles.paragraphs}>
            {chiSiamo.paragraphs.map((paragraph) => (
              <p key={paragraph} className="body">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal offset={8} variant="scale" className={styles.image}>
          <ImagePlaceholder label={chiSiamo.imageLabel} aspectRatio="4 / 5" variant="oliva" />
        </Reveal>
      </div>
    </section>
  )
}
