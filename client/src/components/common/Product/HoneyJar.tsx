import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import '@fontsource/josefin-sans/200.css'
import '@fontsource/josefin-sans/300.css'
import '@fontsource/antic-didone/400.css'
import { EASE_OUT, REVEAL_VIEWPORT } from '@/lib/motion'
import styles from './Product.module.css'

// Vasetto di miele in SVG con un'etichetta nello stile di quella dell'olio. Il miele si riempie
// all'ingresso, il coperchio si posa e una goccia scivola dal bordo, in loop lento.

const JAR =
  'M62 120 Q62 104 78 104 L222 104 Q238 104 238 120 L238 128 Q252 140 252 168 L252 318 Q252 348 222 348 L78 348 Q48 348 48 318 L48 168 Q48 140 62 128 Z'

const INK = '#1f2a38'

interface HoneyJarProps {
  className?: string
  label?: string
}

export function HoneyJar({ className, label = 'Vasetto di miele Le Quote' }: HoneyJarProps) {
  const uid = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()
  const enter = (delay: number) => ({
    initial: reduceMotion ? false : ({ opacity: 0, y: 8 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  })

  return (
    <motion.svg
      viewBox="0 0 300 380"
      className={`${styles.product} ${className ?? ''}`}
      role="img"
      aria-label={label}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ type: 'spring', stiffness: 70, damping: 15 }}
      whileHover={reduceMotion ? undefined : { rotate: -2, transition: { type: 'spring', stiffness: 140, damping: 10 } }}
    >
      <defs>
        <clipPath id={`honey-jar-body-${uid}`}>
          <path d={JAR} />
        </clipPath>
        <linearGradient id={`honey-jar-honey-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2bd4c" />
          <stop offset="0.5" stopColor="#d9922c" />
          <stop offset="1" stopColor="#a4611a" />
        </linearGradient>
        <linearGradient id={`honey-jar-lid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d2a45e" />
          <stop offset="1" stopColor="#8f5a27" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#honey-jar-body-${uid})`}>
        <rect x="40" y="100" width="220" height="260" fill="#f3e3c2" opacity="0.5" />
        {/* Il miele sale dal fondo: si anima l'altezza con una scala dal basso */}
        <motion.rect
          x="40"
          y="128"
          width="220"
          height="230"
          fill={`url(#honey-jar-honey-${uid})`}
          style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
          initial={reduceMotion ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.3 }}
        />
        <rect x="64" y="150" width="9" height="170" rx="4.5" fill="#ffffff" opacity="0.28" />
      </g>
      <path d={JAR} fill="none" stroke="#6e4a1c" strokeOpacity="0.45" strokeWidth="1.5" />

      {/* Coperchio: scende e si posa */}
      <motion.g
        initial={reduceMotion ? false : { y: -40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 1.2 }}
      >
        <rect x="58" y="62" width="184" height="46" rx="8" fill={`url(#honey-jar-lid-${uid})`} />
        {[78, 98, 118, 138, 158, 178, 198, 218].map((x) => (
          <rect key={x} x={x} y="68" width="3" height="34" rx="1.5" fill="#6f4420" opacity="0.35" />
        ))}
      </motion.g>

      {/* Goccia che scivola dal bordo del coperchio, in loop lento */}
      {!reduceMotion && (
        <motion.path
          d="M232 108 q4 0 4 8 q0 8 -4 10 q-4 -2 -4 -10 q0 -8 4 -8 z"
          fill="#d9922c"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 0, 200], opacity: [0, 1, 0] }}
          transition={{ duration: 3.4, times: [0, 0.25, 1], repeat: Infinity, repeatDelay: 2.2, delay: 2.6, ease: 'easeIn' }}
        />
      )}

      {/* Etichetta */}
      <rect x="74" y="178" width="152" height="128" rx="2" fill="#fdfcf9" />
      <g fill={INK} textAnchor="middle">
        <motion.text x="150" y="208" fontFamily="'Josefin Sans', sans-serif" fontWeight="200" fontSize="22" letterSpacing="2.8" {...enter(1.4)}>
          LE QUOTE
        </motion.text>
        <motion.text x="150" y="222" fontFamily="'Josefin Sans', sans-serif" fontWeight="300" fontSize="7" letterSpacing="0.8" {...enter(1.5)}>
          IL MIELE DI CERCHIO
        </motion.text>
        <motion.text x="150" y="258" fontFamily="'Antic Didone', serif" fontSize="22" letterSpacing="2" {...enter(1.65)}>
          MIELE
        </motion.text>
        <motion.path
          d="M96 272 H204"
          stroke={INK}
          strokeWidth="0.6"
          initial={reduceMotion ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 1.75 }}
        />
        <motion.text x="150" y="294" fontFamily="'Antic Didone', serif" fontSize="15" {...enter(1.9)}>
          500 g <tspan fontFamily="'Segoe UI Symbol', 'Apple Symbols', 'Cambria Math', 'DejaVu Sans', sans-serif" fontSize="11">℮</tspan>
        </motion.text>
      </g>
    </motion.svg>
  )
}
