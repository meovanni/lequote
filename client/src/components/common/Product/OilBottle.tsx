import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import '@fontsource/josefin-sans/200.css'
import '@fontsource/josefin-sans/300.css'
import '@fontsource/antic-didone/400.css'
import { EASE_OUT, REVEAL_VIEWPORT } from '@/lib/motion'
import styles from './Product.module.css'

// Bottiglia da 750 ml disegnata in SVG, con il fronte dell'etichetta Le Quote (stessi caratteri
// dell'etichetta di stampa: Josefin Sans e Antic Didone). Illustrazione, non foto: resta nitida
// a ogni misura e non pesa come un video.

// Marasca: corpo squadrato, spalle corte e collo breve, la bottiglia tipica dell'olio.
const BODY =
  'M72 618 Q60 618 60 604 L60 268 Q60 252 72 244 L100 222 Q106 217 106 208 L106 160 L134 160 L134 208 Q134 217 140 222 L168 244 Q180 252 180 268 L180 604 Q180 618 168 618 Z'

const OIL_REST = 'M58 262 Q90 256 120 262 T182 262 L182 622 L58 622 Z'
const OIL_WAVE = 'M58 262 Q90 268 120 262 T182 262 L182 622 L58 622 Z'

const INK = '#1f2a38'

interface OilBottleProps {
  className?: string
  /** Testo alternativo: descrive l'illustrazione, non il prodotto in generale. */
  label?: string
}

export function OilBottle({ className, label = 'Bottiglia da 750 ml di olio extravergine Le Quote' }: OilBottleProps) {
  const uid = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()
  const loop = (duration: number, delay = 0) =>
    reduceMotion ? { duration: 0 } : { duration, delay, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <motion.svg
      viewBox="0 96 240 532"
      className={`${styles.product} ${className ?? ''}`}
      role="img"
      aria-label={label}
      initial={reduceMotion ? false : { opacity: 0, y: 80, rotate: -6 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ type: 'spring', stiffness: 60, damping: 14, mass: 1.1 }}
      whileHover={reduceMotion ? undefined : { rotate: 3, transition: { type: 'spring', stiffness: 120, damping: 10 } }}
    >
      <defs>
        <clipPath id={`oil-bottle-body-${uid}`}>
          <path d={BODY} />
        </clipPath>
        <linearGradient id={`oil-bottle-oil-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9a43c" />
          <stop offset="0.55" stopColor="#7d7a24" />
          <stop offset="1" stopColor="#3f4512" />
        </linearGradient>
        <linearGradient id={`oil-bottle-glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1e2c19" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#2c3f22" stopOpacity="0.25" />
          <stop offset="1" stopColor="#141d10" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`oil-bottle-sweep-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.g
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={loop(6, 1.2)}
      >
        {/* Capsula */}
        <rect x="102" y="112" width="36" height="62" rx="5" fill={INK} />
        <rect x="102" y="158" width="36" height="4" fill="#9c6530" />
        <rect x="100" y="106" width="40" height="11" rx="4" fill="#2b3a4d" />

        <g clipPath={`url(#oil-bottle-body-${uid})`}>
          <rect x="56" y="150" width="130" height="480" fill="#2a3a21" />
          <motion.path
            d={OIL_REST}
            fill={`url(#oil-bottle-oil-${uid})`}
            animate={reduceMotion ? undefined : { d: [OIL_REST, OIL_WAVE, OIL_REST] }}
            transition={loop(4)}
          />
          <rect x="56" y="150" width="130" height="480" fill={`url(#oil-bottle-glass-${uid})`} />
          {/* Riflesso fisso sul fianco sinistro e lampo di luce che attraversa il vetro */}
          <rect x="70" y="276" width="7" height="320" rx="3.5" fill="#ffffff" opacity="0.18" />
          <g transform="skewX(-12)">
            <motion.rect
              x="-60"
              y="150"
              width="60"
              height="480"
              fill={`url(#oil-bottle-sweep-${uid})`}
              animate={reduceMotion ? undefined : { x: [0, 360] }}
              transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut', delay: 1.5 }}
            />
          </g>
        </g>
        <path d={BODY} fill="none" stroke="#0f160c" strokeOpacity="0.6" strokeWidth="1.5" />

        <Label />
      </motion.g>
    </motion.svg>
  )
}

function Label() {
  const reduceMotion = useReducedMotion()
  const draw = (delay: number) => ({
    initial: reduceMotion ? false : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: 1.2, ease: EASE_OUT, delay },
  })
  const appear = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 6 },
    whileInView: { opacity: 1, y: 0 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  })

  return (
    <g>
      <rect x="66" y="300" width="108" height="166" rx="2" fill="#fdfcf9" />
      <g fill={INK} textAnchor="middle">
        <motion.text x="120" y="331" fontFamily="'Josefin Sans', sans-serif" fontWeight="200" fontSize="13.5" letterSpacing="1.6" {...appear(0.5)}>
          LE QUOTE
        </motion.text>
        <motion.text x="120" y="342" fontFamily="'Josefin Sans', sans-serif" fontWeight="300" fontSize="5" letterSpacing="0.5" {...appear(0.6)}>
          L’OLIO DEL BORSACCHIO
        </motion.text>
        <motion.text x="120" y="374" fontFamily="'Antic Didone', serif" fontSize="14" letterSpacing="1.4" {...appear(0.75)}>
          OLIO
        </motion.text>
        <motion.text x="120" y="389" fontFamily="'Antic Didone', serif" fontSize="8.6" letterSpacing="0.7" {...appear(0.85)}>
          EXTRA VERGINE
        </motion.text>
        <motion.text x="120" y="400" fontFamily="'Antic Didone', serif" fontSize="8.6" letterSpacing="0.7" {...appear(0.9)}>
          DI OLIVA
        </motion.text>
        <motion.path d="M72 418 H86" stroke={INK} strokeWidth="0.6" {...draw(1)} />
        <motion.path d="M168 418 H154" stroke={INK} strokeWidth="0.6" {...draw(1)} />
        <motion.text x="120" y="420" fontFamily="'Instrument Sans Variable', sans-serif" fontWeight="700" fontSize="4.8" letterSpacing="0.4" {...appear(1.05)}>
          ESTRATTO A FREDDO
        </motion.text>
        {/* Né Antic Didone né il carattere del sito hanno il segno ℮: lo si prende dai font di sistema. */}
        <motion.text x="120" y="446" fontFamily="'Antic Didone', serif" fontSize="16" {...appear(1.2)}>
          750 ml <tspan fontFamily="'Segoe UI Symbol', 'Apple Symbols', 'Cambria Math', 'DejaVu Sans', sans-serif" fontSize="12">℮</tspan>
        </motion.text>
        <motion.path d="M76 456 H164" stroke={INK} strokeWidth="0.5" {...draw(1.3)} />
      </g>
    </g>
  )
}
