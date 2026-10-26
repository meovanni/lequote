import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import '@fontsource/josefin-sans/200.css'
import '@fontsource/josefin-sans/300.css'
import '@fontsource/antic-didone/400.css'
import { EASE_OUT, REVEAL_VIEWPORT } from '@/lib/motion'
import styles from './Product.module.css'

// Latta da 5 litri in SVG, sorella della bottiglia: corpo in latta con bordature, maniglia e
// tappo, e la stessa etichetta Le Quote. Prende il posto della foto finché non c'è quella vera.

const INK = '#1f2a38'

interface OilTinProps {
  className?: string
  label?: string
}

export function OilTin({ className, label = 'Latta da 5 litri di olio extravergine Le Quote' }: OilTinProps) {
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
      whileHover={reduceMotion ? undefined : { rotate: 2, transition: { type: 'spring', stiffness: 140, damping: 10 } }}
    >
      <defs>
        <linearGradient id={`oil-tin-body-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5f6a33" />
          <stop offset="0.35" stopColor="#8a9450" />
          <stop offset="0.6" stopColor="#6c7739" />
          <stop offset="1" stopColor="#3f4720" />
        </linearGradient>
        <linearGradient id={`oil-tin-metal-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa0a6" />
          <stop offset="0.45" stopColor="#e4e7ea" />
          <stop offset="1" stopColor="#7d838a" />
        </linearGradient>
      </defs>

      {/* Maniglia e tappo sul coperchio */}
      <path d="M112 74 Q112 40 150 40 Q188 40 188 74" fill="none" stroke={`url(#oil-tin-metal-${uid})`} strokeWidth="7" strokeLinecap="round" />
      <rect x="196" y="56" width="26" height="22" rx="3" fill="#c9a43a" />
      <rect x="192" y="74" width="34" height="8" rx="2" fill={`url(#oil-tin-metal-${uid})`} />

      {/* Corpo con le bordature del coperchio e del fondo */}
      <rect x="62" y="82" width="176" height="268" rx="6" fill={`url(#oil-tin-body-${uid})`} />
      <rect x="58" y="78" width="184" height="12" rx="3" fill={`url(#oil-tin-metal-${uid})`} />
      <rect x="58" y="342" width="184" height="12" rx="3" fill={`url(#oil-tin-metal-${uid})`} />
      <rect x="76" y="100" width="8" height="232" rx="4" fill="#ffffff" opacity="0.18" />

      {/* Etichetta */}
      <rect x="86" y="138" width="128" height="160" rx="2" fill="#fdfcf9" />
      <g fill={INK} textAnchor="middle">
        <motion.text x="150" y="170" fontFamily="'Josefin Sans', sans-serif" fontWeight="200" fontSize="19" letterSpacing="2.4" {...enter(0.5)}>
          LE QUOTE
        </motion.text>
        <motion.text x="150" y="183" fontFamily="'Josefin Sans', sans-serif" fontWeight="300" fontSize="6" letterSpacing="0.7" {...enter(0.6)}>
          RISERVA DEL BORSACCHIO
        </motion.text>
        <motion.text x="150" y="220" fontFamily="'Antic Didone', serif" fontSize="20" letterSpacing="2" {...enter(0.75)}>
          OLIO
        </motion.text>
        <motion.text x="150" y="236" fontFamily="'Antic Didone', serif" fontSize="8" letterSpacing="1.2" {...enter(0.8)}>
          EXTRA VERGINE DI OLIVA
        </motion.text>
        <motion.path
          d="M104 252 H196"
          stroke={INK}
          strokeWidth="0.6"
          initial={reduceMotion ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.9 }}
        />
        <motion.text x="150" y="280" fontFamily="'Antic Didone', serif" fontSize="16" {...enter(1)}>
          5 L <tspan fontFamily="'Segoe UI Symbol', 'Apple Symbols', 'Cambria Math', 'DejaVu Sans', sans-serif" fontSize="11">℮</tspan>
        </motion.text>
      </g>
    </motion.svg>
  )
}
