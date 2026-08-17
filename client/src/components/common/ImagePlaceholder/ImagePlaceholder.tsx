import { CameraIcon } from '@/components/common/icons/Icons'
import styles from './ImagePlaceholder.module.css'

interface ImagePlaceholderProps {
  label: string
  aspectRatio?: string
  variant?: 'neutral' | 'oliva' | 'miele'
  className?: string
}

export function ImagePlaceholder({
  label,
  aspectRatio = '4 / 5',
  variant = 'neutral',
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={[styles.placeholder, styles[variant], className].filter(Boolean).join(' ')}
      style={{ aspectRatio }}
    >
      <span className={styles.caption}>
        <CameraIcon className={styles.icon} />
        <span className={`${styles.label} mono-label`}>{label}</span>
      </span>
    </div>
  )
}
