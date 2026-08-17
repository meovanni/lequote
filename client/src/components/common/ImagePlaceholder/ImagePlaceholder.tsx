import { CameraIcon } from '@/components/common/icons/Icons'
import styles from './ImagePlaceholder.module.css'

interface ImagePlaceholderProps {
  label: string
  aspectRatio?: string
  variant?: 'neutral' | 'oliva' | 'miele'
  className?: string
  /** Se presente, mostra la foto reale al posto del placeholder testurizzato. */
  src?: string
  alt?: string
  /** 'cover' per foto a piena scena, 'contain' per prodotti isolati su sfondo trasparente. */
  fit?: 'cover' | 'contain'
  /** false = nessuna card (sfondo/bordo/ombra): la foto (o il cutout) fluttua a vista nuda. */
  container?: boolean
}

export function ImagePlaceholder({
  label,
  aspectRatio = '4 / 5',
  variant = 'neutral',
  className,
  src,
  alt,
  fit = 'cover',
  container = true,
}: ImagePlaceholderProps) {
  if (src && !container) {
    return (
      <div className={[styles.bare, className].filter(Boolean).join(' ')} style={{ aspectRatio }}>
        <img
          src={src}
          alt={alt ?? label}
          loading="lazy"
          className={styles.bareImg}
          style={{ objectFit: fit }}
        />
      </div>
    )
  }

  if (src) {
    return (
      <div
        className={[styles.photo, styles[variant], className].filter(Boolean).join(' ')}
        style={{ aspectRatio }}
      >
        <img
          src={src}
          alt={alt ?? label}
          loading="lazy"
          className={styles.photoImg}
          style={{ objectFit: fit }}
        />
      </div>
    )
  }

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
