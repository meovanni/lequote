import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath } from '@/i18n/locales'
import { formatPrice } from '@/lib/price'
import { lineLabel } from '@/cart/lineLabel'
import { site } from '@/data/published'
import { legalByLocale } from '@/data/legal'
import { retrieveOrder, type OrderSummary } from '@/lib/medusa/cart'
import { CartTotals } from '@/components/cart/CartTotals'
import styles from '@/components/cart/Cart.module.css'

type OrderState =
  { status: 'loading' } | { status: 'ready'; order: OrderSummary } | { status: 'missing' } | { status: 'error' }

// /ordine?id=…: la pagina è statica, l'ordine si legge da Medusa con il suo id (non indovinabile).
export function OrderConfirmation() {
  const content = useContent()
  const { orderUi } = content
  const locale = useLocale()
  const [params] = useSearchParams()
  const orderId = params.get('id')
  const [state, setState] = useState<OrderState>({ status: 'loading' })

  useEffect(() => {
    if (!orderId) {
      setState({ status: 'missing' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    retrieveOrder(orderId)
      .then((order) => {
        if (!cancelled) setState({ status: 'ready', order })
      })
      .catch((reason: unknown) => {
        console.error(reason)
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (state.status !== 'ready') {
    const message = {
      loading: orderUi.loading,
      missing: orderUi.missing,
      error: orderUi.error,
    }[state.status]
    return (
      <section className={styles.page} data-surface="light">
        <div className={styles.inner}>
          <h1 className="title-mark display-2">{state.status === 'error' ? orderUi.title : orderUi.missing}</h1>
          {state.status !== 'missing' && (
            <p className={`${styles.status} body`} role="status">
              {message}
            </p>
          )}
          <a href={localizePath(locale, '/')} className="btn btn-ghost mono-label">
            {orderUi.backHome}
          </a>
        </div>
      </section>
    )
  }

  const { order } = state
  const bank = site.business.BANK_TRANSFER
  return (
    <section className={styles.page} data-surface="light">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className="specimen-tag specimen">{orderUi.number(order.code)}</span>
          <h1 className="title-mark display-2">{orderUi.title}</h1>
          <p className="body-lead">{orderUi.body(order.email)}</p>
        </header>

        <div className={styles.layout}>
          <div className={styles.main}>
            {order.paymentMethod === 'bonifico' && (
              <section className={styles.block} aria-labelledby="order-bank">
                <h2 id="order-bank" className={`${styles.blockTitle} mono-label`}>
                  {orderUi.bankTitle}
                </h2>
                {!bank.iban && <p className="body">{orderUi.bankPending}</p>}
                <dl className={styles.details}>
                  {bank.iban && bank.holder && (
                    <div className={styles.detail}>
                      <dt className="body-sm">{orderUi.bankHolder}</dt>
                      <dd className="body">{bank.holder}</dd>
                    </div>
                  )}
                  {bank.iban && (
                    <div className={styles.detail}>
                      <dt className="body-sm">{orderUi.bankIban}</dt>
                      <dd className="body mono-figure">{bank.iban}</dd>
                    </div>
                  )}
                  <div className={styles.detail}>
                    <dt className="body-sm">{orderUi.bankReason}</dt>
                    <dd className="body">{orderUi.bankReasonValue(order.code)}</dd>
                  </div>
                  <div className={styles.detail}>
                    <dt className="body-sm">{orderUi.bankAmount}</dt>
                    <dd className="body">{formatPrice(locale, order.total)}</dd>
                  </div>
                </dl>
                <p className={`${styles.help} body-sm`}>{orderUi.bankNote}</p>
              </section>
            )}
            {order.paymentMethod === 'ritiro' && (
              <section className={styles.block} aria-labelledby="order-pickup">
                <h2 id="order-pickup" className={`${styles.blockTitle} mono-label`}>
                  {orderUi.pickupPaymentTitle}
                </h2>
                <p className="body">{content.checkoutUi.paymentOptions.ritiro.note}</p>
              </section>
            )}

            <section className={styles.block} aria-labelledby="order-items">
              <h2 id="order-items" className={`${styles.blockTitle} mono-label`}>
                {orderUi.summaryTitle}
              </h2>
              <dl className={styles.details}>
                <div className={styles.detail}>
                  <dt className="body-sm">{orderUi.deliveryLabel}</dt>
                  <dd className="body">{order.shippingName}</dd>
                </div>
                {order.lines.map((line) => {
                  const { name, format } = lineLabel(content, line)
                  return (
                    <div key={line.id} className={styles.detail}>
                      <dt className="body-sm">
                        {line.quantity} × {format}
                      </dt>
                      <dd className="body">
                        {name} · {formatPrice(locale, line.total)}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </section>

            <a href={localizePath(locale, '/')} className={`${styles.submit} btn btn-ghost mono-label`}>
              {orderUi.backHome}
            </a>
            {/* Funzione di recesso raggiungibile anche dall'ordine, con il numero già compilato. */}
            <p className={`${styles.status} body-sm`}>
              <a href={`${localizePath(locale, '/recesso')}?ordine=${order.code}`}>
                {legalByLocale[locale].withdrawalForm.openButton}
              </a>
            </p>
          </div>
          <aside className={styles.aside}>
            <CartTotals
              itemTotal={order.itemTotal}
              shippingTotal={order.shippingTotal}
              taxTotal={order.taxTotal}
              total={order.total}
              shippingChosen
            />
          </aside>
        </div>
      </div>
    </section>
  )
}
