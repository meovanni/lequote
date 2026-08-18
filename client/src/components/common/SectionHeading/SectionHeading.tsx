import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  title: string
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
  /** true = titolo visibile (display-1); default = nascosto ma presente per screen reader/SEO. */
  visible?: boolean
}

export function SectionHeading({ title, subtitle, align = 'left', className, visible = false }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, styles[align], className].filter(Boolean).join(' ')}>
      <h2 className={[styles.title, 'display-1', !visible && 'sr-only'].filter(Boolean).join(' ')}>{title}</h2>
      {subtitle && <p className={`${styles.subtitle} body-lead`}>{subtitle}</p>}
    </div>
  )
}
