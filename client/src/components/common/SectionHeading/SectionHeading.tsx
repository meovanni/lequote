import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  title: string
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ title, subtitle, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, styles[align], className].filter(Boolean).join(' ')}>
      <h2 className={`${styles.title} display-1 sr-only`}>{title}</h2>
      {subtitle && <p className={`${styles.subtitle} body-lead`}>{subtitle}</p>}
    </div>
  )
}
