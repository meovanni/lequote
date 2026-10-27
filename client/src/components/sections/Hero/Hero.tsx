import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT, riseChild, staggerParent } from '@/lib/motion'
import { useContent } from '@/i18n/LocaleContext'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Hero.module.css'

/**
 * MP4/H.264 generati da scripts/encode-hero-video.sh, letti da tutti i browser (il .mov HEVC
 * originale non decodificava in Chrome; il WebM/VP9 veniva più pesante); sul telefono la versione
 * da 960 px. Indice all'inizio del file: il video
 * parte appena arriva il primo pezzo e continua mentre si scarica. Se nessuna sorgente parte resta
 * il poster. Scritto come HTML perché React non mette "muted" nella pagina generata in anticipo, e
 * senza quell'attributo il browser blocca l'avvio automatico finché il JavaScript non è caricato.
 */
function videoMarkup(poster: string, className: string): string {
  const mobile = 'media="(max-width: 768px)"'
  return [
    // oncanplay: parte appena c'è il primo pezzo, senza aspettare che il browser stimi di poterlo
    // riprodurre tutto (l'avvio automatico da solo, su una rete lenta, aspetta molto) e senza
    // aspettare il JavaScript del sito.
    `<video class="${className}" autoplay muted loop playsinline preload="auto" poster="${poster}" aria-hidden="true" oncanplay="var p=this.play();p&&p.catch(function(){})">`,
    `<source src="/videos/intro-mobile.mp4" type='video/mp4; codecs="avc1.640028"' ${mobile}>`,
    `<source src="/videos/intro.mp4" type='video/mp4; codecs="avc1.640028"'>`,
    '</video>',
  ].join('')
}

export function Hero() {
  const { hero } = useContent()
  const reduceMotion = useReducedMotion()
  const [showFallback, setShowFallback] = useState(false)
  const videoBoxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowFallback(true)
      return
    }

    const video = videoBoxRef.current?.querySelector('video')
    if (!video) return
    // L'errore di caricamento arriva sull'ultima <source>, non sul <video>.
    const lastSource = video.querySelector('source:last-of-type')

    const handleFail = () => setShowFallback(true)
    // Alcuni browser caricano una traccia che non sanno decodificare senza emettere 'error':
    // i dati arrivano ma non c'è un fotogramma reale (videoWidth 0). Caso osservato in Chrome
    // con il vecchio .mov HEVC. Su una rete lenta invece il poster del <video> copre l'attesa,
    // quindi niente timeout: il video parte quando arriva.
    const handleLoadedData = () => {
      if (video.videoWidth === 0 || video.videoHeight === 0) handleFail()
    }
    // Il video deve girare sempre, anche se arriva a pezzi: appena c'è abbastanza per ripartire
    // (dopo il primo pezzo, dopo un'attesa di dati, tornando sulla scheda) si rilancia. Un
    // autoplay rifiutato (risparmio energetico, policy del browser) non è un errore: resta il poster.
    const play = () => {
      if (!video.paused || document.hidden) return
      // play() restituisce una promessa solo nei browser recenti.
      video.play()?.catch(() => undefined)
    }
    const onVisibility = () => play()
    video.addEventListener('error', handleFail)
    lastSource?.addEventListener('error', handleFail)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', play)
    video.addEventListener('stalled', play)
    video.addEventListener('waiting', play)
    document.addEventListener('visibilitychange', onVisibility)
    play()

    return () => {
      video.removeEventListener('error', handleFail)
      lastSource?.removeEventListener('error', handleFail)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', play)
      video.removeEventListener('stalled', play)
      video.removeEventListener('waiting', play)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <section id="hero" data-surface="dark" className={styles.hero}>
      <div className={styles.videoLayer}>
        {showFallback ? (
          <img className={styles.poster} src={hero.poster} alt={hero.posterAlt} />
        ) : (
          /* Il <video> è scritto come HTML: React non mette l'attributo "muted" nella pagina
             generata in anticipo, e senza il browser blocca l'avvio automatico finché il JavaScript
             non è caricato (su una rete lenta, anche per decine di secondi). */
          <div ref={videoBoxRef} className={styles.videoBox} dangerouslySetInnerHTML={{ __html: videoMarkup(hero.poster, styles.video) }} />
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
            visible: {
              clipPath: 'inset(0 0% 0 0)',
              opacity: 1,
              transition: { duration: 1.4, ease: EASE_OUT },
            },
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
          transition={{
            duration: 2.4,
            times: [0, 0.2, 0.8, 1],
            repeat: Infinity,
            delay: 2.2,
            ease: 'easeInOut',
          }}
        />
      )}
    </section>
  )
}
