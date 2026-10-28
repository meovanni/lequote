import { useContent, useLocale } from '@/i18n/LocaleContext'
import { sectionHref } from '@/i18n/locales'
import { useCart } from '@/cart/CartContext'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { CartLines } from './CartLines'
import { CartTotals } from './CartTotals'
import styles from './Cart.module.css'

// /carrello: righe del carrello e checkout ospite nella stessa pagina, totali a lato.
export function CartPage() {
  const { cartUi } = useContent()
  const locale = useLocale()
  const { cart, loading, error } = useCart()
  const shopHref = sectionHref(locale, 'shop')

  return (
    <section className={styles.page} data-surface="light">
      <div className={styles.inner}>
        <header className={styles.header}>
          <a href={shopHref} className={`${styles.back} mono-label`}>
            ← {cartUi.continueShopping}
          </a>
          <h1 className="title-mark display-2">{cartUi.title}</h1>
        </header>

        {loading ? (
          <p className={`${styles.status} body`} role="status">
            {cartUi.loading}
          </p>
        ) : !cart || cart.lines.length === 0 ? (
          <div className={styles.empty}>
            <p className="body-lead">{cartUi.empty}</p>
            <a href={shopHref} className="btn btn-primary mono-label">
              {cartUi.emptyLink}
            </a>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.main}>
              <section className={styles.block} aria-label={cartUi.itemsTitle}>
                <CartLines cart={cart} />
                {error && (
                  <p className={`${styles.errorBox} body-sm`} role="alert">
                    {error === 'add' ? cartUi.addError : cartUi.updateError}
                  </p>
                )}
              </section>
              <CheckoutForm key={cart.id} cart={cart} />
            </div>
            <aside className={styles.aside}>
              <CartTotals
                itemTotal={cart.itemTotal}
                shippingTotal={cart.shippingTotal}
                taxTotal={cart.taxTotal}
                total={cart.total}
                shippingChosen={cart.shippingOptionId !== null}
              />
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
