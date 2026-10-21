import { useContent, useLocale } from '@/i18n/LocaleContext'
import { formatPrice } from '@/lib/price'
import styles from './Cart.module.css'

interface CartTotalsProps {
  itemTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  /** false finché non è scelta un'opzione di consegna. */
  shippingChosen: boolean
  title?: string
}

// Totali IVA inclusa: l'IVA si mostra come quota del totale, non come voce aggiunta.
export function CartTotals({ itemTotal, shippingTotal, taxTotal, total, shippingChosen, title }: CartTotalsProps) {
  const { cartUi } = useContent()
  const locale = useLocale()
  const shipping = !shippingChosen
    ? cartUi.shippingTbd
    : shippingTotal === 0
      ? cartUi.shippingFree
      : formatPrice(locale, shippingTotal)

  return (
    <div className={styles.totals}>
      {title && <h2 className={`${styles.blockTitle} mono-label`}>{title}</h2>}
      <div className={`${styles.totalsRow} body`}>
        <span>{cartUi.subtotal}</span>
        <span>{formatPrice(locale, itemTotal)}</span>
      </div>
      <div className={`${styles.totalsRow} body`}>
        <span>{cartUi.shipping}</span>
        <span>{shipping}</span>
      </div>
      <div className={`${styles.totalsRow} ${styles.totalsGrand} body`}>
        <span>{cartUi.total}</span>
        <span>{formatPrice(locale, total)}</span>
      </div>
      <span className={`${styles.totalsNote} body-sm`}>{cartUi.taxIncluded(formatPrice(locale, taxTotal))}</span>
    </div>
  )
}
