import type { CSSProperties, ReactNode, Ref } from 'react'
import styles from './Reveal.module.css'

interface RevealProps {
  children: ReactNode
  /** Sfasa l'inizio del movimento (in punti percentuali) per creare una cascata tra elementi affiancati. */
  offset?: number
  /** Firma di movimento della sezione: 'up' (default), 'scale', 'sideLeft', 'sideRight'. */
  variant?: 'up' | 'scale' | 'sideLeft' | 'sideRight'
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function Reveal({ children, offset = 0, variant = 'up', className, ref }: RevealProps) {
  const style = offset
    ? ({ '--enter-range': `entry ${offset}% entry ${55 + offset}%` } as CSSProperties)
    : undefined

  const variantClass = variant !== 'up' ? styles[variant] : undefined

  return (
    <div ref={ref} className={[styles.reveal, variantClass, className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}
