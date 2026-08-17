import type { CSSProperties, ReactNode } from 'react'
import styles from './Reveal.module.css'

interface RevealProps {
  children: ReactNode
  /** Sfasa l'inizio del movimento (in punti percentuali) per creare una cascata tra elementi affiancati. */
  offset?: number
  /** Firma di movimento della sezione: 'up' (default), 'scale', 'sideLeft', 'sideRight'. */
  variant?: 'up' | 'scale' | 'sideLeft' | 'sideRight'
  className?: string
}

export function Reveal({ children, offset = 0, variant = 'up', className }: RevealProps) {
  const style = offset
    ? ({ '--enter-range': `entry ${offset}% entry ${55 + offset}%` } as CSSProperties)
    : undefined

  const variantClass = variant !== 'up' ? styles[variant] : undefined

  return (
    <div className={[styles.reveal, variantClass, className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}
