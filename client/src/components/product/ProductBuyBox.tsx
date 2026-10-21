import { useId, useState } from 'react'
import { Link } from 'react-router'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { formatPrice } from '@/lib/price'
import { localizePath } from '@/i18n/locales'
import { useCart } from '@/cart/CartContext'
import { QuantityStepper } from '@/components/common/QuantityStepper/QuantityStepper'
import type { CatalogState } from '@/hooks/useCatalogProduct'
import type { CatalogVariant } from '@/lib/medusa/catalog'
import styles from './ProductDetail.module.css'

interface ProductBuyBoxProps {
  catalog: CatalogState
  variantLabels: Record<string, string>
}

const LOW_STOCK = 5
const MAX_PER_ORDER = 20

function stockLabel(variant: CatalogVariant, labels: ReturnType<typeof useContent>['productUi']) {
  if (variant.price === null) return labels.notOnSale
  if (!variant.purchasable) return labels.soldOut
  if (variant.stock !== null && variant.stock <= LOW_STOCK) return labels.lowStock(variant.stock)
  return labels.available
}

// Scelta del formato, prezzo e disponibilità. I dati arrivano da Medusa dopo il caricamento della
// pagina: finché non ci sono, uno spazio riservato della stessa altezza evita salti del layout.
export function ProductBuyBox({ catalog, variantLabels }: ProductBuyBoxProps) {
  const { productUi, cartUi } = useContent()
  const locale = useLocale()
  const groupId = useId()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedId, setAddedId] = useState<string | null>(null)
  const { busy, error, addItem } = useCart()

  if (catalog.status === 'loading') {
    return (
      <div className={styles.buyBox} aria-busy="true">
        <p className={`${styles.status} body-sm`} role="status">
          {productUi.loading}
        </p>
      </div>
    )
  }

  // Ordine dei formati come nei contenuti (dal più piccolo), non quello del back office.
  const order = Object.keys(variantLabels)
  const rank = (sku: string) => (order.includes(sku) ? order.indexOf(sku) : order.length)
  const variants = (catalog.status === 'ready' ? (catalog.product?.variants ?? []) : []).toSorted(
    (a, b) => rank(a.sku) - rank(b.sku),
  )
  if (variants.length === 0) {
    return (
      <div className={styles.buyBox}>
        <p className={`${styles.status} body-sm`} role="status">
          {catalog.status === 'error' ? productUi.loadError : productUi.notOnSale}
        </p>
      </div>
    )
  }

  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants.find((v) => v.purchasable) ?? variants[0]
  const selectedLabel = variantLabels[selected.sku] ?? selected.title

  return (
    <div className={styles.buyBox}>
      <fieldset className={styles.formats}>
        <legend className={`${styles.formatsLegend} mono-label`} id={groupId}>
          {productUi.formatLabel}
        </legend>
        <div className={styles.formatOptions}>
          {variants.map((variant) => (
            <label key={variant.id} className={styles.formatOption}>
              <input
                type="radio"
                name={groupId}
                value={variant.id}
                checked={variant.id === selected.id}
                onChange={() => {
                  setSelectedId(variant.id)
                  setQuantity(1)
                  setAddedId(null)
                }}
                className={styles.formatInput}
              />
              <span className={`${styles.formatPill} mono-label`}>{variantLabels[variant.sku] ?? variant.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.priceRow}>
        <span className={`${styles.price} display-2`}>
          {selected.price === null ? '—' : formatPrice(locale, selected.price)}
        </span>
        <span className={`${styles.taxNote} body-sm`}>{productUi.taxIncluded}</span>
      </div>
      <p className={`${styles.stock} body-sm`} data-available={selected.purchasable} role="status">
        {stockLabel(selected, productUi)}
      </p>

      {selected.purchasable && (
        <div className={styles.addRow}>
          <QuantityStepper
            value={quantity}
            min={1}
            max={Math.min(MAX_PER_ORDER, selected.stock ?? MAX_PER_ORDER)}
            onDecrement={() => setQuantity((value) => value - 1)}
            onIncrement={() => setQuantity((value) => value + 1)}
            decrementLabel={cartUi.decrease(selectedLabel)}
            incrementLabel={cartUi.increase(selectedLabel)}
          />
          <button
            type="button"
            className="btn btn-primary mono-label"
            disabled={busy}
            onClick={async () => {
              setAddedId(null)
              if (await addItem(selected.id, quantity)) setAddedId(selected.id)
            }}
          >
            {busy ? cartUi.adding : cartUi.addToCart}
          </button>
        </div>
      )}
      <div aria-live="polite">
        {addedId === selected.id && (
          <p className="body-sm">
            {cartUi.added}{' '}
            <Link to={localizePath(locale, '/carrello')} className={styles.addedLink}>
              {cartUi.goToCart}
            </Link>
          </p>
        )}
        {error === 'add' && <p className={`${styles.addError} body-sm`}>{cartUi.addError}</p>}
      </div>
    </div>
  )
}
