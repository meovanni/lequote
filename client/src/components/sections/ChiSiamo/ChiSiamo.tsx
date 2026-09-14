import { chiSiamo } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './ChiSiamo.module.css'

export function ChiSiamo() {
  return (
    <section id="chi-siamo" data-surface="light-alt" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <Reveal>
            <SectionHeading title={chiSiamo.title} visible />
          </Reveal>
          <div className={styles.paragraphs}>
            {chiSiamo.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph} offset={6 + index * 6}>
                <p className={index === 0 ? `${styles.lead} body-lead` : 'body'}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal offset={8} variant="scale" className={styles.image}>
          <ImagePlaceholder label={chiSiamo.imageLabel} aspectRatio="4 / 5" variant="oliva" />
        </Reveal>
      </div>
    </section>
  )
}
