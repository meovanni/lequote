import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath } from '@/i18n/locales'
import { formatPrice } from '@/lib/price'
import { useCart } from '@/cart/CartContext'
import {
  listShippingChoices,
  placeOrder,
  setShippingChoice,
  updateCustomer,
  type Cart,
  type PaymentMethod,
  type ShippingChoice,
} from '@/lib/medusa/cart'
import { EMPTY_CHECKOUT, FIELD_ORDER, validateCheckout, type CheckoutErrors, type CheckoutValues } from './validate'
import styles from '@/components/cart/Cart.module.css'

type TextField = 'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'postalCode' | 'city' | 'province'

const PAYMENT_METHODS: PaymentMethod[] = ['bonifico', 'ritiro']

type ChoicesState = { status: 'loading' } | { status: 'ready'; choices: ShippingChoice[] } | { status: 'error' }

interface FieldProps {
  id: string
  label: string
  error?: string
  help?: string
  children: (describedBy: string | undefined) => ReactNode
}

function Field({ id, label, error, help, children }: FieldProps) {
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`${styles.label} mono-label`}>
        {label}
      </label>
      {children(describedBy)}
      {help && (
        <span id={`${id}-help`} className={`${styles.help} body-sm`}>
          {help}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className={`${styles.error} body-sm`}>
          {error}
        </span>
      )}
    </div>
  )
}

// Checkout ospite in una pagina: dati, consegna, pagamento, accettazione delle condizioni. I
// controlli lato browser servono a chi compila; Medusa ricontrolla giacenze e prezzi alla chiusura.
export function CheckoutForm({ cart }: { cart: Cart }) {
  const { checkoutUi, cartUi } = useContent()
  const locale = useLocale()
  const navigate = useNavigate()
  const { replace, forget } = useCart()
  const formId = useId()
  const [values, setValues] = useState<CheckoutValues>({
    ...EMPTY_CHECKOUT,
    deliveryId: cart.shippingOptionId,
  })
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [choices, setChoices] = useState<ChoicesState>({ status: 'loading' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    listShippingChoices(cart.id)
      .then((list) => {
        if (!cancelled) setChoices({ status: 'ready', choices: list })
      })
      .catch((reason: unknown) => {
        console.error(reason)
        if (!cancelled) setChoices({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [cart.id])

  const available = choices.status === 'ready' ? choices.choices : []
  const delivery = available.find((choice) => choice.id === values.deliveryId)
  const canDeliver = available.some((choice) => choice.kind === 'delivery')
  const errorText = (field: keyof CheckoutValues) => {
    const code = errors[field]
    return code ? checkoutUi.errors[code] : undefined
  }
  const id = (field: string) => `${formId}-${field}`

  function update<K extends keyof CheckoutValues>(field: K, value: CheckoutValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function chooseDelivery(choice: ShippingChoice) {
    setValues((prev) => ({
      ...prev,
      deliveryId: choice.id,
      // Il pagamento al ritiro non vale per la spedizione.
      payment: choice.kind === 'delivery' && prev.payment === 'ritiro' ? null : prev.payment,
    }))
    setErrors((prev) => ({ ...prev, deliveryId: undefined }))
    try {
      replace(await setShippingChoice(cart.id, choice.id))
    } catch (reason) {
      // Si riprova alla conferma dell'ordine: qui serve solo ad aggiornare i totali.
      console.error(reason)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validateCheckout(values, delivery)
    setErrors(found)
    setSubmitError(false)
    const first = FIELD_ORDER.find((field) => found[field])
    if (first) {
      errorSummaryRef.current?.focus()
      return
    }
    if (!delivery || !values.payment) return

    setSubmitting(true)
    try {
      const shipsHome = delivery.kind === 'delivery'
      await updateCustomer(
        cart.id,
        values.email.trim(),
        {
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          phone: values.phone.trim(),
          ...(shipsHome && {
            address_1: values.address.trim(),
            postal_code: values.postalCode.trim(),
            city: values.city.trim(),
            province: values.province.trim().toUpperCase(),
          }),
        },
        // La lingua di adesso: chi ha cambiato lingua dopo aver riempito il carrello riceve
        // l'email in quella in cui ha completato l'ordine.
        locale,
      )
      const ready = await setShippingChoice(cart.id, delivery.id)
      const orderId = await placeOrder(ready, values.payment)
      forget()
      void navigate(`${localizePath(locale, '/ordine')}?id=${encodeURIComponent(orderId)}`)
    } catch (reason) {
      console.error(reason)
      setSubmitError(true)
      setSubmitting(false)
    }
  }

  const textInput =
    (field: TextField, type: string, autoComplete: string, extra: object = {}) =>
    (describedBy?: string) => (
      <input
        id={id(field)}
        name={field}
        type={type}
        className={styles.input}
        value={values[field]}
        onChange={(event) => update(field, event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={describedBy}
        required
        {...extra}
      />
    )

  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <form className={styles.main} onSubmit={handleSubmit} noValidate>
      <div ref={errorSummaryRef} tabIndex={-1} aria-live="assertive">
        {hasErrors && <p className={`${styles.errorBox} body-sm`}>{checkoutUi.errorSummary}</p>}
      </div>

      <section className={styles.block} aria-labelledby={id('contact')}>
        <h2 id={id('contact')} className={`${styles.blockTitle} mono-label`}>
          {checkoutUi.contactTitle}
        </h2>
        <div className={`${styles.fields} ${styles.fieldsTwo}`}>
          <Field id={id('firstName')} label={checkoutUi.firstName} error={errorText('firstName')}>
            {textInput('firstName', 'text', 'given-name')}
          </Field>
          <Field id={id('lastName')} label={checkoutUi.lastName} error={errorText('lastName')}>
            {textInput('lastName', 'text', 'family-name')}
          </Field>
          <Field id={id('email')} label={checkoutUi.email} error={errorText('email')} help={checkoutUi.emailHelp}>
            {textInput('email', 'email', 'email', { inputMode: 'email' })}
          </Field>
          <Field id={id('phone')} label={checkoutUi.phone} error={errorText('phone')} help={checkoutUi.phoneHelp}>
            {textInput('phone', 'tel', 'tel', { inputMode: 'tel' })}
          </Field>
        </div>
      </section>

      <section className={styles.block} aria-labelledby={id('delivery')}>
        <h2 id={id('delivery')} className={`${styles.blockTitle} mono-label`}>
          {checkoutUi.deliveryTitle}
        </h2>
        {choices.status === 'loading' && <p className={`${styles.status} body-sm`}>{checkoutUi.deliveryLoading}</p>}
        {choices.status === 'error' && <p className={`${styles.errorBox} body-sm`}>{checkoutUi.errors.submit}</p>}
        {choices.status === 'ready' && (
          <fieldset className={styles.choices} aria-describedby={errors.deliveryId ? id('delivery-error') : undefined}>
            <legend className="sr-only">{checkoutUi.deliveryTitle}</legend>
            {available.map((choice) => (
              <label key={choice.id} className={styles.choice}>
                <input
                  type="radio"
                  name="delivery"
                  value={choice.id}
                  checked={values.deliveryId === choice.id}
                  onChange={() => void chooseDelivery(choice)}
                />
                <span className={styles.choiceText}>
                  <span className={`${styles.choiceHead} body`}>
                    <span>{choice.kind === 'pickup' ? checkoutUi.pickupLabel(choice.city) : choice.name}</span>
                    <span>{choice.amount === 0 ? cartUi.shippingFree : formatPrice(locale, choice.amount)}</span>
                  </span>
                  <span className={`${styles.choiceNote} body-sm`}>
                    {choice.kind === 'pickup' ? checkoutUi.pickupNote : checkoutUi.deliveryNote}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        {choices.status === 'ready' && !canDeliver && (
          <p className={`${styles.notice} body-sm`}>{checkoutUi.noDelivery}</p>
        )}
        {errors.deliveryId && (
          <span id={id('delivery-error')} className={`${styles.error} body-sm`}>
            {errorText('deliveryId')}
          </span>
        )}

        {delivery?.kind === 'delivery' && (
          <div className={`${styles.fields} ${styles.fieldsAddress}`}>
            <Field id={id('address')} label={checkoutUi.address} error={errorText('address')}>
              {textInput('address', 'text', 'street-address')}
            </Field>
            <Field id={id('city')} label={checkoutUi.city} error={errorText('city')}>
              {textInput('city', 'text', 'address-level2')}
            </Field>
            <Field id={id('postalCode')} label={checkoutUi.postalCode} error={errorText('postalCode')}>
              {textInput('postalCode', 'text', 'postal-code', {
                inputMode: 'numeric',
                maxLength: 5,
              })}
            </Field>
            <Field id={id('province')} label={checkoutUi.province} error={errorText('province')}>
              {textInput('province', 'text', 'address-level1', {
                maxLength: 2,
              })}
            </Field>
          </div>
        )}
      </section>

      <section className={styles.block} aria-labelledby={id('payment')}>
        <h2 id={id('payment')} className={`${styles.blockTitle} mono-label`}>
          {checkoutUi.paymentTitle}
        </h2>
        <fieldset className={styles.choices} aria-describedby={errors.payment ? id('payment-error') : undefined}>
          <legend className="sr-only">{checkoutUi.paymentTitle}</legend>
          {PAYMENT_METHODS.map((method) => {
            const option = checkoutUi.paymentOptions[method]
            const pickupOnly = method === 'ritiro' && delivery?.kind === 'delivery'
            return (
              <label key={method} className={styles.choice}>
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={values.payment === method}
                  disabled={pickupOnly}
                  onChange={() => update('payment', method)}
                />
                <span className={styles.choiceText}>
                  <span className="body">{option.label}</span>
                  <span className={`${styles.choiceNote} body-sm`}>
                    {pickupOnly ? checkoutUi.pickupOnly : option.note}
                  </span>
                </span>
              </label>
            )
          })}
        </fieldset>
        {errors.payment && (
          <span id={id('payment-error')} className={`${styles.error} body-sm`}>
            {errorText('payment')}
          </span>
        )}
      </section>

      <section className={styles.block}>
        <label className={`${styles.terms} body-sm`}>
          <input
            type="checkbox"
            checked={values.terms}
            onChange={(event) => update('terms', event.target.checked)}
            aria-invalid={Boolean(errors.terms)}
            aria-describedby={errors.terms ? id('terms-error') : undefined}
          />
          <span>
            {checkoutUi.termsBefore}
            <a href={localizePath(locale, '/condizioni-di-vendita')} target="_blank" rel="noopener">
              {checkoutUi.termsLink}
            </a>
            {checkoutUi.termsMiddle}
            <a href={localizePath(locale, '/privacy')} target="_blank" rel="noopener">
              {checkoutUi.privacyLink}
            </a>
            {checkoutUi.termsAfter}
          </span>
        </label>
        {errors.terms && (
          <span id={id('terms-error')} className={`${styles.error} body-sm`}>
            {errorText('terms')}
          </span>
        )}
        <p className={`${styles.help} body-sm`}>
          {checkoutUi.withdrawalNote}
          <a href={localizePath(locale, '/recesso')} target="_blank" rel="noopener">
            {checkoutUi.withdrawalLink}
          </a>
        </p>

        {submitError && (
          <p className={`${styles.errorBox} body-sm`} role="alert">
            {checkoutUi.errors.submit}
          </p>
        )}
        <button type="submit" className={`${styles.submit} btn btn-primary mono-label`} disabled={submitting}>
          {submitting ? checkoutUi.submitting : checkoutUi.submit}
        </button>
      </section>
    </form>
  )
}
