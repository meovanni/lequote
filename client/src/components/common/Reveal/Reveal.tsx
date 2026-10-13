import type { ReactNode, Ref } from 'react'
import { motion, useReducedMotion, type TargetAndTransition } from 'motion/react'
import { EASE_OUT, REVEAL_VIEWPORT } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  /** Ritardo relativo (in punti, ~12 ms l'uno) per creare una cascata tra elementi affiancati. */
  offset?: number
  /** Firma di movimento della sezione: 'up' (default), 'scale', 'sideLeft', 'sideRight'. */
  variant?: 'up' | 'scale' | 'sideLeft' | 'sideRight'
  className?: string
  ref?: Ref<HTMLDivElement>
}

const FROM: Record<NonNullable<RevealProps['variant']>, TargetAndTransition> = {
  up: { opacity: 0, y: 40 },
  scale: { opacity: 0, scale: 0.92 },
  sideLeft: { opacity: 0, x: -56 },
  sideRight: { opacity: 0, x: 56 },
}

// Entrata a tempo, non legata allo scroll: parte una volta quando il blocco compare e dura meno
// di un secondo, poi il contenuto segue il dito come il resto della pagina. Per questo vale anche
// sul telefono, dove gli effetti agganciati allo scroll restano vietati (lib/nativeScroll.ts).
export function Reveal({ children, offset = 0, variant = 'up', className, ref }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduceMotion ? false : FROM[variant]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.9, ease: EASE_OUT, delay: offset * 0.012 }}
    >
      {children}
    </motion.div>
  )
}
