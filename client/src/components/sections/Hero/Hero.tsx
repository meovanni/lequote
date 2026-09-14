import { useEffect, useRef, useState } from 'react'
import { hero } from '@/data/content'
import { VideoIcon } from '@/components/common/icons/Icons'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Hero.module.css'

export function Hero() {
  const [showFallback, setShowFallback] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowFallback(true)
      return
    }

    const video = videoRef.current
    if (!video) return

    const handleFail = () => setShowFallback(true)
    video.addEventListener('error', handleFail)
    video.addEventListener('stalled', handleFail)

    // Alcuni browser rifiutano silenziosamente una sorgente non decodificabile senza mai
    // emettere 'error' (es. codec non supportato in un contenitore riconosciuto): se dopo
    // qualche secondo non ha ancora dati riproducibili, passiamo al fallback statico.
    // Caso osservato in Chrome con questo file (HEVC in un contenitore .mov): il browser apre
    // il contenitore e "riproduce" (readyState 4, currentTime che avanza, nessun error), ma la
    // traccia video non decodifica mai un fotogramma reale — videoWidth/videoHeight restano 0.
    const timeout = window.setTimeout(() => {
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) handleFail()
    }, 4000)

    return () => {
      video.removeEventListener('error', handleFail)
      video.removeEventListener('stalled', handleFail)
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <section id="hero" data-surface="dark" className={styles.hero}>
      <div className={styles.videoLayer}>
        {!showFallback && (
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onError={() => setShowFallback(true)}
          >
            <source src="/videos/intro_long.mov" />
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
                VIDEO: Dal Borsacchio alle quote di Cerchio
              </span>
            </div>
          </div>
        )}

        <div className={styles.overlay} />
      </div>

      <div className={styles.inner}>
        <h1 className={styles.title}>
          <Logo className={styles.logo} title={hero.title} />
        </h1>
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
