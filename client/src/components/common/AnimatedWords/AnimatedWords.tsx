import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT, REVEAL_VIEWPORT } from '@/lib/motion'
import styles from './AnimatedWords.module.css'

interface AnimatedWordsProps {
  text: string
  /** Ritardo prima della prima parola, in secondi. */
  delay?: number
  /** true = parte subito al montaggio (hero), false = quando entra nello schermo. */
  immediate?: boolean
}

// Ogni parola sale da sotto una linea invisibile, una dopo l'altra: l'entrata dei titoli in
// tutto il sito. Il testo intero resta leggibile dagli screen reader in un'unica stringa; le
// parole animate sono solo decorazione.
export function AnimatedWords({ text, delay = 0, immediate = false }: AnimatedWordsProps) {
  const reduceMotion = useReducedMotion()
  const words = text.split(/\s+/).filter(Boolean)

  if (reduceMotion) return <>{text}</>

  const trigger = immediate ? { animate: 'visible' } : { whileInView: 'visible', viewport: REVEAL_VIEWPORT }

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        className={styles.words}
        initial="hidden"
        {...trigger}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.07, delayChildren: delay },
          },
        }}
      >
        {words.map((word, index) => (
          // Spazio vero tra le parole (non un margine): a capo la riga nuova non resta rientrata.
          <Fragment key={`${word}-${index}`}>
            {index > 0 && ' '}
            <span className={styles.mask}>
              <motion.span
                className={styles.word}
                variants={{
                  hidden: { y: '110%' },
                  visible: {
                    y: '0%',
                    transition: { duration: 0.9, ease: EASE_OUT },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </motion.span>
    </>
  )
}
