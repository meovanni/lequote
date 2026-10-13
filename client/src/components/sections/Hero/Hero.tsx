import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT, riseChild, staggerParent } from '@/lib/motion'
import { hero } from '@/data/content'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Hero.module.css'

export function Hero() {
  const reduceMotion = useReducedMotion()
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

      {/* Entrata in sequenza al caricamento: il logo si rivela da sinistra, poi sottotitolo,
          testo e bottoni. Con "riduci movimento" tutto è già al suo posto. */}
      <motion.div
        className={styles.inner}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        variants={staggerParent(0.14, 0.15)}
      >
        <motion.h1
          className={styles.title}
          variants={{
            hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
            visible: { clipPath: 'inset(0 0% 0 0)', opacity: 1, transition: { duration: 1.4, ease: EASE_OUT } },
          }}
        >
          <Logo className={styles.logo} title={hero.title} />
        </motion.h1>
        <motion.p className={`${styles.subtitle} display-2`} variants={riseChild}>
          {hero.subtitle}
        </motion.p>
        <motion.p className={`${styles.body} body`} variants={riseChild}>
          {hero.body}
        </motion.p>

        <motion.div className={styles.actions} variants={riseChild}>
          <a href={hero.ctaPrimary.href} className="btn btn-primary mono-label">
            {hero.ctaPrimary.label}
          </a>
          <a href={hero.ctaSecondary.href} className="btn btn-ghost mono-label">
            {hero.ctaSecondary.label}
          </a>
        </motion.div>
      </motion.div>

      {!reduceMotion && (
        <motion.span
          className={styles.scrollCue}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 0, 14, 14] }}
          transition={{ duration: 2.4, times: [0, 0.2, 0.8, 1], repeat: Infinity, delay: 2.2, ease: 'easeInOut' }}
        />
      )}
    </section>
  )
}
