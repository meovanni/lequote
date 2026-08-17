import { useEffect, useState } from 'react'
import { hero } from '@/data/content'
import { VideoIcon } from '@/components/common/icons/Icons'
import { Eyebrow } from '@/components/common/Eyebrow/Eyebrow'
import styles from './Hero.module.css'

export function Hero() {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowFallback(true)
    }
  }, [])

  return (
    <section id="hero" data-surface="dark" className={styles.hero}>
      <div className={styles.videoLayer}>
        {!showFallback && (
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onError={() => setShowFallback(true)}
          >
            <source src="/videos/intro_long.mov" type="video/quicktime" />
          </video>
        )}

        {showFallback && (
          <div className={styles.videoFallback}>
            <div
              className={styles.videoPlaceholder}
              role="img"
              aria-label="Video: panoramica aerea tra gli uliveti della Riserva del Borsacchio e le quote di Cerchio"
            >
              <VideoIcon className={styles.videoPlaceholderIcon} />
              <span className={`${styles.videoPlaceholderLabel} mono-label`}>
                VIDEO — Dal Borsacchio alle quote di Cerchio
              </span>
            </div>
          </div>
        )}

        <div className={styles.overlay} />
      </div>

      <div className={styles.inner}>
        <Eyebrow className={styles.eyebrow}>{hero.eyebrow}</Eyebrow>
        <h1 className={`${styles.title} display-hero`}>{hero.title}</h1>
        <p className={`${styles.subtitle} body-lead`}>{hero.subtitle}</p>
        <p className={`${styles.body} body`}>{hero.body}</p>

        <div className={styles.actions}>
          <a href={hero.ctaPrimary.href} className={`${styles.ctaPrimary} mono-label`}>
            {hero.ctaPrimary.label}
          </a>
          <a href={hero.ctaSecondary.href} className={`${styles.ctaSecondary} mono-label`}>
            {hero.ctaSecondary.label}
          </a>
        </div>
      </div>
    </section>
  )
}
