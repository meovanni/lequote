import { CameraIcon } from '@/components/common/icons/Icons'
import { useLocale } from '@/i18n/LocaleContext'
import styles from './ImagePlaceholder.module.css'

const PLACEHOLDER_TEXT = { it: 'Immagine in arrivo', en: 'Image coming soon', de: 'Bild folgt' } as const

interface ImagePlaceholderProps {
  label: string
  aspectRatio?: string
  /** Non più usato: la palette è neutra (resta per compatibilità con le chiamate esistenti). */
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
  className,
  src,
  alt,
  fit = 'cover',
  container = true,
}: ImagePlaceholderProps) {
  const locale = useLocale()
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
        className={[styles.photo, className].filter(Boolean).join(' ')}
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

  // Foto non ancora disponibile: al visitatore basta sapere che arriva; la descrizione completa
  // (cosa fotografare) resta per gli screen reader e al passaggio del mouse.
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={[styles.placeholder, className].filter(Boolean).join(' ')}
      style={{ aspectRatio }}
    >
      <span className={styles.caption} aria-hidden="true">
        <CameraIcon className={styles.icon} />
        <span className={`${styles.label} body-sm`}>{PLACEHOLDER_TEXT[locale]}</span>
      </span>
    </div>
  )
}
