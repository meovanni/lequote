import { miele } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { HexPattern } from '@/components/common/HexPattern/HexPattern'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Miele.module.css'

export function Miele() {
  return (
    <section id="miele" data-surface="light-alt" className={styles.section}>
      <HexPattern className={styles.hexPattern} />

      <div className={styles.inner}>
        <Reveal className={styles.text}>
          <SectionHeading title={miele.title} visible />
          <p className="body">{miele.body}</p>

          <ul className={styles.varieties}>
            {miele.varieties.map((variety, index) => (
              <li key={variety.name}>
                <Reveal offset={index * 8} variant="up" className={styles.variety}>
                  <span className="display-3">{variety.name}</span>
                  <span className={`${styles.varietyNote} body-sm`}>{variety.note}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal offset={8} variant="sideRight" className={styles.images}>
          <ImagePlaceholder
            label={miele.imageLabel}
            aspectRatio="4 / 3"
            variant="miele"
            src={miele.image}
          />
          <ImagePlaceholder
            label={miele.imageLabelAlt}
            aspectRatio="4 / 3"
            variant="miele"
            src={miele.imageAlt}
            fit="contain"
          />
        </Reveal>
      </div>
    </section>
  )
}
