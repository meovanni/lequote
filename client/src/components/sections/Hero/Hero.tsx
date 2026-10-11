import { useEffect, useRef, useState } from 'react'
import { hero } from '@/data/content'
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
    // Alcuni browser caricano una traccia che non sanno decodificare senza emettere 'error':
    // i dati arrivano ma non c'è un fotogramma reale (videoWidth 0). Caso osservato in Chrome
    // con il vecchio .mov HEVC. Su una rete lenta invece il poster del <video> copre l'attesa,
    // quindi niente timeout: il video parte quando arriva.
    const handleLoadedData = () => {
      if (video.videoWidth === 0 || video.videoHeight === 0) handleFail()
    }
    video.addEventListener('error', handleFail)
    video.addEventListener('loadeddata', handleLoadedData)

    return () => {
      video.removeEventListener('error', handleFail)
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [])

  return (
    <section id="hero" data-surface="dark" className={styles.hero}>
      <div className={styles.videoLayer}>
        {showFallback ? (
          <img className={styles.poster} src={hero.poster} alt={hero.posterAlt} />
        ) : (
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={hero.poster}
            aria-hidden="true"
          >
            {/* WebM/VP9 e MP4/H.264 generati da scripts/encode-hero-video.sh: il .mov HEVC
                originale non decodificava in Chrome. Se nessuna sorgente parte resta il poster.
                L'errore di caricamento arriva sull'ultima <source>, non sul <video>. */}
            <source src="/videos/intro.webm" type='video/webm; codecs="vp9"' />
            <source
              src="/videos/intro.mp4"
              type='video/mp4; codecs="avc1.640028"'
              onError={() => setShowFallback(true)}
            />
          </video>
        )}

        <div className={styles.overlay} />
      </div>

      <div className={styles.inner}>
        <h1 className={styles.title}>
          <Logo className={styles.logo} title={hero.title} />
        </h1>
        <p className={`${styles.subtitle} display-2`}>{hero.subtitle}</p>
        <p className={`${styles.body} body`}>{hero.body}</p>

        <div className={styles.actions}>
          <a href={hero.ctaPrimary.href} className="btn btn-primary mono-label">
            {hero.ctaPrimary.label}
          </a>
          <a href={hero.ctaSecondary.href} className="btn btn-ghost mono-label">
            {hero.ctaSecondary.label}
          </a>
        </div>
      </div>
    </section>
  )
}
