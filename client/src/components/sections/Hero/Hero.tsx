import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT, riseChild, staggerParent } from '@/lib/motion'
import { useContent } from '@/i18n/LocaleContext'
import { Logo } from '@/components/common/Logo/Logo'
import styles from './Hero.module.css'

export function Hero() {
  const { hero } = useContent()
  const reduceMotion = useReducedMotion()

  return (
    <section id="hero" data-surface="dark" className={styles.hero}>
      <div className={styles.mediaLayer}>
        {/* La foto del viale degli ulivi, a misura per telefono e computer. È la prima cosa che si
            vede: si carica subito e con priorità alta. Profilo colore Display P3 dello scatto
            originale, così non perde saturazione. */}
        <img
          className={styles.photo}
          src={hero.poster}
          srcSet={`${hero.posterSmall} 1080w, ${hero.poster} 1920w`}
          sizes="100vw"
          width={1920}
          height={1440}
          alt={hero.posterAlt}
          fetchPriority="high"
          decoding="async"
        />
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
