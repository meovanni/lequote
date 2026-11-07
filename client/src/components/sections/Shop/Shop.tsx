import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath } from '@/i18n/locales'
import { formatPrice } from '@/lib/price'
import { useCart } from '@/cart/CartContext'
import { useCatalogProduct } from '@/hooks/useCatalogProduct'
import type { CatalogVariant } from '@/lib/medusa/catalog'
import type { ShopProduct, ShopVariantOption } from '@/types'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { QuantityStepper } from '@/components/common/QuantityStepper/QuantityStepper'
import { REVEAL_VIEWPORT, riseChild, staggerParent } from '@/lib/motion'
import styles from './Shop.module.css'

// Massimo ordinabile per formato quando la giacenza non è gestita.
const MAX_PER_LINE = 20

interface VariantCardProps {
  product: ShopProduct
  option: ShopVariantOption
  variant: CatalogVariant | undefined
  loading: boolean
}

// Foto del formato dal back office; finché manca, il riquadro dice "Immagine in arrivo".
function VariantImage({ product, option }: { product: ShopProduct; option: ShopVariantOption }) {
  return (
    <ImagePlaceholder
      label={option.imageLabel}
      aspectRatio="1 / 1"
      variant={product.id === 'olio' ? 'oliva' : 'miele'}
      src={option.image || undefined}
      fit="cover"
    />
  )
}

function VariantCard({ product, option, variant, loading }: VariantCardProps) {
  const { cartUi, productUi } = useContent()
  const locale = useLocale()
  const { cart, busy, addItem, setQuantity } = useCart()
  const line = variant ? cart?.lines.find((item) => item.variantId === variant.id) : undefined
  const itemName = `${product.name}, ${option.label}`
  const max = variant?.stock ?? MAX_PER_LINE
  const unavailable = !loading && (!variant || !variant.purchasable)

  let control
  if (loading) {
    control = <span className={`${styles.variantStatus} body-sm`}>…</span>
  } else if (!variant || !variant.purchasable) {
    control = (
      <span className={`${styles.variantStatus} body-sm`}>
        {variant?.price === null || !variant ? productUi.notOnSale : productUi.soldOut}
      </span>
    )
  } else if (line) {
    control = (
      <QuantityStepper
        value={line.quantity}
        onDecrement={() => void setQuantity(line.id, line.quantity - 1)}
        onIncrement={() => void setQuantity(line.id, line.quantity + 1)}
        decrementLabel={cartUi.decrease(itemName)}
        incrementLabel={cartUi.increase(itemName)}
        max={max}
        disabled={busy}
      />
    )
  } else {
    control = (
      <button
        type="button"
        className={`${styles.addButton} mono-label`}
        onClick={() => void addItem(variant.id, 1)}
        disabled={busy}
        aria-label={`${cartUi.addToCart}: ${itemName}`}
      >
        {cartUi.addShort}
      </button>
    )
  }

  return (
    <motion.div
      className={styles.variantCard}
      variants={riseChild}
      whileHover={{
        y: -6,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      {/* Un formato che non si può ordinare resta in vetrina, spento e con la scritta. */}
      <div className={styles.variantMedia} data-unavailable={unavailable}>
        <VariantImage product={product} option={option} />
        {unavailable && <span className={`${styles.unavailableBadge} mono-label`}>{productUi.unavailable}</span>}
      </div>
      <div className={styles.variantCardBody}>
        <span className="body">{option.label}</span>
        <span className={`${styles.variantPrice} mono-figure`}>
          {variant?.price != null ? formatPrice(locale, variant.price) : '—'}
        </span>
        {control}
      </div>
    </motion.div>
  )
}

function ShopProductBlock({ product }: { product: ShopProduct }) {
  const { productUi } = useContent()
  const locale = useLocale()
  const catalog = useCatalogProduct(product.handle)
  const variants = catalog.status === 'ready' ? (catalog.product?.variants ?? []) : []

  return (
    <div className={styles.product}>
      <div className={styles.productHeading}>
        <Link to={localizePath(locale, `/prodotti/${product.handle}`)} className={`${styles.productLink} display-3`}>
          {product.name}
        </Link>
        <p className={`${styles.productNote} body-sm`}>{product.note}</p>
      </div>

      {catalog.status === 'error' && (
        <p className={`${styles.errorText} body-sm`} role="alert">
          {productUi.loadError}
        </p>
      )}

      {/* Griglia a riflusso: un formato in più si aggiunge senza ridisegnare le colonne. */}
      <motion.div
        className={styles.variantGrid}
        initial="hidden"
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
        variants={staggerParent(0.1, 0.2)}
      >
        {product.variants.map((option) => (
          <VariantCard
            key={option.id}
            product={product}
            option={option}
            variant={variants.find((variant) => variant.sku === option.sku)}
            loading={catalog.status === 'loading'}
          />
        ))}
      </motion.div>
    </div>
  )
}

export function Shop() {
  const { shop, shopCatalog, cartUi } = useContent()
  const locale = useLocale()
  const { cart, error } = useCart()
  const count = cart?.itemCount ?? 0

  return (
    <section id="shop" data-surface="light-alt" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.heading}>
          <SectionHeading title={shop.title} subtitle={shop.intro} visible />
        </Reveal>

        <Reveal offset={8} className={styles.catalog}>
          {shopCatalog.map((product) => (
            <ShopProductBlock key={product.id} product={product} />
          ))}
        </Reveal>

        {error && (
          <p className={`${styles.errorText} body-sm`} role="alert">
            {error === 'add' ? cartUi.addError : cartUi.updateError}
          </p>
        )}

        {count > 0 && cart && (
          <div className={`${styles.summary} ${styles.fieldReveal}`} role="status">
            <div className={styles.summaryRow}>
              <span className={`${styles.summaryTitle} mono-label`}>{shop.summaryTitle}</span>
              <span className="body-sm">{shop.summaryCount(count)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span className="body-sm">{shop.totalLabel}</span>
              <span className="mono-figure">{formatPrice(locale, cart.itemTotal)}</span>
            </div>
            <Link to={localizePath(locale, '/carrello')} className={`${styles.cta} mono-label`}>
              {cartUi.goToCart}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
