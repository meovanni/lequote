import { territorio } from '@/data/content'
import { elevationMarkers } from '@/data/elevations'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { TopoLine } from '@/components/common/TopoLine/TopoLine'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Territorio.module.css'

export function Territorio() {
  return (
    <section id="territorio" data-surface="light" className={styles.section}>
      <div className={styles.inner}>
        <Reveal>
          <SectionHeading title={territorio.title} subtitle={territorio.intro} align="center" />
        </Reveal>

        <div className={styles.topoWrapper}>
          <TopoLine markers={elevationMarkers} />
        </div>
      </div>
    </section>
  )
}
