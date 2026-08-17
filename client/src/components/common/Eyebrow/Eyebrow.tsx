import type { ReactNode } from 'react'
import styles from './Eyebrow.module.css'

interface EyebrowProps {
  children: ReactNode
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span className={[styles.chip, className].filter(Boolean).join(' ')}>
      <span className={styles.dot} aria-hidden="true" />
      <span className="eyebrow">{children}</span>
    </span>
  )
}
