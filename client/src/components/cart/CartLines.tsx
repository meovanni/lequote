import { Link } from 'react-router'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath } from '@/i18n/locales'
import { formatPrice } from '@/lib/price'
import { useCart } from '@/cart/CartContext'
import { lineLabel } from '@/cart/lineLabel'
import type { Cart } from '@/lib/medusa/cart'
import { QuantityStepper } from '@/components/common/QuantityStepper/QuantityStepper'
import styles from './Cart.module.css'

const MAX_PER_LINE = 20

export function CartLines({ cart }: { cart: Cart }) {
  const content = useContent()
  const { cartUi } = content
  const locale = useLocale()
  const { busy, setQuantity } = useCart()

  return (
    <ul className={styles.lines}>
      {cart.lines.map((line) => {
        const { name, format } = lineLabel(content, line)
        const itemName = `${name}, ${format}`
        return (
          <li key={line.id} className={styles.line}>
            <div className={styles.lineInfo}>
              <Link to={localizePath(locale, `/prodotti/${line.productHandle}`)} className={`${styles.lineName} body`}>
                {name}
              </Link>
              <span className={`${styles.lineMeta} body-sm`}>
                {format} · {formatPrice(locale, line.unitPrice)}
              </span>
            </div>
            <div className={styles.lineControls}>
              <QuantityStepper
                value={line.quantity}
                min={1}
                max={MAX_PER_LINE}
                onDecrement={() => void setQuantity(line.id, line.quantity - 1)}
                onIncrement={() => void setQuantity(line.id, line.quantity + 1)}
                decrementLabel={cartUi.decrease(itemName)}
                incrementLabel={cartUi.increase(itemName)}
                disabled={busy}
              />
              <button
                type="button"
                className={`${styles.remove} body-sm`}
                onClick={() => void setQuantity(line.id, 0)}
                disabled={busy}
                aria-label={`${cartUi.remove}: ${itemName}`}
              >
                {cartUi.remove}
              </button>
            </div>
            <span className={`${styles.lineTotal} body`}>{formatPrice(locale, line.total)}</span>
          </li>
        )
      })}
    </ul>
  )
}
