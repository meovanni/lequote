import { useId, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { useLocale } from '@/i18n/LocaleContext'
import { INTL_LOCALE } from '@/i18n/locales'
import { legalByLocale } from '@/data/legal'
import { EMAIL } from '@/components/checkout/validate'
import { StoreApiError } from '@/lib/medusa/client'
import { submitWithdrawal } from '@/lib/medusa/withdrawal'
import formStyles from '@/components/cart/Cart.module.css'
import styles from './LegalDocumentPage.module.css'

type Field = 'name' | 'email' | 'orderReference'
type Errors = Partial<Record<Field, 'required' | 'email'>>
type Step = { kind: 'closed' } | { kind: 'open' } | { kind: 'sending' } | { kind: 'done'; email: string; sentAt: Date } | { kind: 'error'; tooMany: boolean }

/**
 * Funzione di recesso (Cod. Consumo art. 54-bis): un pulsante "recedere dal contratto qui" apre la
 * dichiarazione, un secondo pulsante "conferma recesso" la invia. Diciture prescritte dalla legge.
 */
export function WithdrawalForm() {
  const locale = useLocale()
  const copy = legalByLocale[locale].withdrawalForm
  const [params] = useSearchParams()
  const [step, setStep] = useState<Step>(() => (params.has('ordine') || params.has('apri') ? { kind: 'open' } : { kind: 'closed' }))
  const [values, setValues] = useState({ name: '', email: '', orderReference: params.get('ordine') ?? '', details: '', website: '' })
  const [errors, setErrors] = useState<Errors>({})
  const nameRef = useRef<HTMLInputElement | null>(null)
  const id = useId()

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function validate(): Errors {
    const found: Errors = {}
    if (!values.name.trim()) found.name = 'required'
    if (!values.email.trim()) found.email = 'required'
    else if (!EMAIL.test(values.email.trim())) found.email = 'email'
    if (!values.orderReference.trim()) found.orderReference = 'required'
    return found
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStep({ kind: 'sending' })
    try {
      const { submittedAt } = await submitWithdrawal({ ...values, locale })
      setStep({ kind: 'done', email: values.email.trim(), sentAt: submittedAt })
    } catch (error) {
      console.error(error)
      setStep({ kind: 'error', tooMany: error instanceof StoreApiError && error.status === 400 && /Troppe/.test(error.message) })
    }
  }

  if (step.kind === 'closed') {
    return (
      <div className={styles.withdrawal}>
        <button
          type="button"
          className="btn btn-primary mono-label"
          onClick={() => {
            setStep({ kind: 'open' })
            requestAnimationFrame(() => nameRef.current?.focus())
          }}
        >
          {copy.openButton}
        </button>
      </div>
    )
  }

  if (step.kind === 'done') {
    const sentAt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long', timeStyle: 'short' }).format(step.sentAt)
    return (
      <div className={styles.withdrawal} role="status">
        <h2 className="display-3">{copy.doneTitle}</h2>
        <p className="body">{copy.doneBody(step.email, sentAt)}</p>
      </div>
    )
  }

  const errorText = (field: Field) => (errors[field] === 'email' ? copy.invalidEmail : errors[field] ? copy.required : null)
  const input = (field: Field, label: string, type: string, autoComplete: string, help?: string) => (
    <div className={formStyles.field}>
      <label htmlFor={`${id}-${field}`} className={`${formStyles.label} body-sm`}>
        {label}
      </label>
      <input
        ref={field === 'name' ? nameRef : undefined}
        id={`${id}-${field}`}
        className={formStyles.input}
        type={type}
        autoComplete={autoComplete}
        value={values[field]}
        onChange={(event) => set(field)(event.target.value)}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={[help ? `${id}-${field}-help` : '', errors[field] ? `${id}-${field}-error` : ''].filter(Boolean).join(' ') || undefined}
      />
      {help && (
        <span id={`${id}-${field}-help`} className={`${formStyles.help} body-sm`}>
          {help}
        </span>
      )}
      {errors[field] && (
        <span id={`${id}-${field}-error`} className={`${formStyles.error} body-sm`}>
          {errorText(field)}
        </span>
      )}
    </div>
  )

  return (
    <form className={styles.withdrawal} onSubmit={handleSubmit} noValidate>
      <h2 className="display-3">{copy.openButton}</h2>
      <p className="body">{copy.intro}</p>
      <div className={formStyles.fields}>
        {input('name', copy.name, 'text', 'name')}
        {input('email', copy.email, 'email', 'email', copy.emailHelp)}
        {input('orderReference', copy.order, 'text', 'off', copy.orderHelp)}
        <div className={formStyles.field}>
          <label htmlFor={`${id}-details`} className={`${formStyles.label} body-sm`}>
            {copy.details}
          </label>
          <textarea
            id={`${id}-details`}
            className={formStyles.input}
            rows={3}
            maxLength={2000}
            value={values.details}
            onChange={(event) => set('details')(event.target.value)}
            aria-describedby={`${id}-details-help`}
          />
          <span id={`${id}-details-help`} className={`${formStyles.help} body-sm`}>
            {copy.detailsHelp}
          </span>
        </div>
        {/* Campo trappola per i programmi: fuori schermo e fuori dal tab, le persone non lo vedono. */}
        <input
          className={styles.trap}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={values.website}
          onChange={(event) => set('website')(event.target.value)}
        />
      </div>
      {step.kind === 'error' && (
        <p className={`${formStyles.errorBox} body-sm`} role="alert">
          {step.tooMany ? copy.tooMany : copy.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary mono-label" disabled={step.kind === 'sending'}>
        {step.kind === 'sending' ? copy.sending : copy.confirmButton}
      </button>
    </form>
  )
}
