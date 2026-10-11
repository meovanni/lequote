import type { ReactNode } from 'react'
import type { LegalInfoItem } from '@/types'
import styles from './LegalPanel.module.css'

interface LegalPanelProps {
  label: string
  items: LegalInfoItem[]
  /** Nota in coda al pannello (es. cosa resta interno e perché). */
  footnote?: ReactNode
  className?: string
}

/**
 * Pannello "Informazioni di legge": le informazioni obbligatorie restano sempre raggiungibili
 * ma ripiegate, così il racconto viene prima. <details> nativo: accessibile da tastiera e
 * leggibile anche senza JavaScript.
 */
export function LegalPanel({ label, items, footnote, className }: LegalPanelProps) {
  return (
    <details className={[styles.panel, className].filter(Boolean).join(' ')}>
      <summary className={styles.summary}>
        <span className="mono-label">{label}</span>
        <span className={styles.toggle} aria-hidden="true" />
      </summary>

      <div className={styles.content}>
        <dl className={styles.list}>
          {items.map((item) => (
            <div key={item.label} className={styles.row}>
              <dt className={`${styles.term} body-sm`}>{item.label}</dt>
              <dd className={styles.value}>
                <span className="body">{item.value}</span>
                {item.reference && <span className={`${styles.reference} specimen`}>{item.reference}</span>}
              </dd>
            </div>
          ))}
        </dl>
        {footnote && <p className={`${styles.footnote} body-sm`}>{footnote}</p>}
      </div>
    </details>
  )
}
