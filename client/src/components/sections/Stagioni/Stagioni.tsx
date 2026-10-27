import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT, REVEAL_VIEWPORT } from '@/lib/motion'
import { useContent } from '@/i18n/LocaleContext'
import { formatPeriod, isActiveInMonth, monthSegments } from '@/lib/seasons'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Stagioni.module.css'

interface StagioniProps {
  /** Data di riferimento per il mese corrente; iniettabile per i test. */
  now?: Date
}

export function Stagioni({ now = new Date() }: StagioniProps) {
  const { stagioni, ui } = useContent()
  const currentMonth = now.getMonth() + 1
  const reduceMotion = useReducedMotion()
  // Ogni barra cresce da sinistra con un piccolo ritardo rispetto alla precedente.
  let barIndex = 0
  const grow = () => {
    const delay = 0.15 + barIndex++ * 0.07
    return {
      initial: reduceMotion ? false : ({ scaleX: 0 } as const),
      whileInView: { scaleX: 1 },
      viewport: REVEAL_VIEWPORT,
      transition: { duration: 1.1, ease: EASE_OUT, delay },
    }
  }

  return (
    <section id="stagioni" data-surface="light" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <Reveal>
            <p className={`${styles.eyebrow} eyebrow`}>{stagioni.eyebrow}</p>
            <SectionHeading title={stagioni.title} visible />
          </Reveal>
          <Reveal offset={6}>
            <p className={`${styles.intro} body-lead`}>{stagioni.intro}</p>
          </Reveal>
        </header>

        <Reveal offset={10} className={styles.calendar}>
          {/* Intestazione dei mesi solo visiva: gli screen reader leggono il periodo a parole su
              ogni attività e il mese corrente in questa frase. */}
          <p className="sr-only">
            {stagioni.currentMonthLabel}: {stagioni.monthsLong[currentMonth - 1]}
          </p>
          <div className={styles.monthRow} data-month-row aria-hidden="true">
            {stagioni.months.map((month, index) => {
              const isCurrent = index + 1 === currentMonth
              return (
                <span
                  key={month}
                  className={[styles.month, 'specimen', isCurrent ? styles.monthCurrent : ''].filter(Boolean).join(' ')}
                  data-current={isCurrent || undefined}
                >
                  <span className={styles.monthInitial}>{month.charAt(0)}</span>
                  <span className={styles.monthAbbr}>{month}</span>
                </span>
              )
            })}
          </div>

          {stagioni.tracks.map((track) => (
            <div key={track.line} className={styles.track} data-line={track.line}>
              <div className={styles.trackHead}>
                <h3 className="display-3">{track.label}</h3>
                <span className={`${styles.trackPlace} specimen`}>{track.place}</span>
              </div>

              <ul className={styles.activities} aria-label={track.label}>
                {track.activities.map((activity) => {
                  const active = isActiveInMonth(activity, currentMonth)
                  return (
                    <li key={activity.id} className={styles.activity} data-active={active}>
                      <span className={styles.activityText}>
                        <span className="body-sm">{activity.label}</span>
                        <span className={`${styles.activityPeriod} specimen`}>
                          {formatPeriod(activity, stagioni.monthsLong, ui.periodRange)}
                        </span>
                        {active && <span className={`badge ${styles.activeBadge}`}>{ui.seasonActive}</span>}
                      </span>
                      <span className={styles.bars} aria-hidden="true">
                        {monthSegments(activity).map((segment) => (
                          <motion.span
                            key={segment.start}
                            className={styles.bar}
                            style={
                              {
                                '--start': segment.start,
                                '--span': segment.span,
                                originX: 0,
                              } as CSSProperties
                            }
                            {...grow()}
                          />
                        ))}
                        <motion.span
                          initial={reduceMotion ? false : { opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={REVEAL_VIEWPORT}
                          transition={{ duration: 0.6, delay: 1.4 }}
                          className={styles.nowLine}
                          style={{ '--start': currentMonth } as CSSProperties}
                        />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
