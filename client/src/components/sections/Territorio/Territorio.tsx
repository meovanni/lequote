import { territorio } from '@/data/content'
import { elevationMarkers } from '@/data/elevations'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { TopoLine } from '@/components/common/TopoLine/TopoLine'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Territorio.module.css'

export function Territorio() {
  return (
    <section id="territorio" data-surface="light" className={styles.section}>
      <div className={styles.inner}>
        <Reveal>
          <SectionHeading
            eyebrow={territorio.eyebrow}
            title={territorio.title}
            subtitle={territorio.intro}
            align="center"
          />
        </Reveal>

        <div className={styles.topoWrapper}>
          <TopoLine markers={elevationMarkers} />
        </div>

        <div className={styles.cards}>
          {territorio.cards.map((card, index) => (
            <Reveal key={card.id} offset={index * 10} variant="scale" className={styles.card}>
              <span className={`${styles.quota} mono-figure`} data-accent={card.id === 'borsacchio' ? 'oliva' : 'miele'}>
                {card.quotaLabel}
              </span>
              <h3 className="display-3">{card.title}</h3>
              <p className={`${styles.place} body-sm`}>{card.place}</p>
              <p className="body">{card.body}</p>
              <ImagePlaceholder
                label={card.imageLabel}
                aspectRatio="3 / 4"
                variant={card.id === 'borsacchio' ? 'oliva' : 'miele'}
                className={styles.image}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
