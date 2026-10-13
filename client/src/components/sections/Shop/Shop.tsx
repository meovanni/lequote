import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { shop, shopCatalog } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder/ImagePlaceholder'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { motion } from 'motion/react'
import { OilBottle } from '@/components/common/Product/OilBottle'
import { HoneyJar } from '@/components/common/Product/HoneyJar'
import { REVEAL_VIEWPORT, riseChild, staggerParent } from '@/lib/motion'
import { MinusIcon, PlusIcon } from '@/components/common/icons/Icons'
import styles from './Shop.module.css'

type Quantities = Record<string, number>
type Fulfillment = 'spedizione' | 'ritiro' | null

interface FormErrors {
  selection?: string
  fulfillment?: string
  name?: string
  email?: string
  address?: string
}

// Morphing tra le fasi invece di scatti di stato, dove il browser lo supporta: la richiesta
// di un layout reflow (compare/scompare l'indirizzo, il blocco d'invio diventa la conferma)
// viene incorniciata invece di limitarsi ad accadere. Nessuna dipendenza: se l'API manca, o se
// l'utente preferisce meno movimento, lo stato cambia comunque, solo senza la cornice.
function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown }
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (typeof doc.startViewTransition === 'function' && !prefersReducedMotion) {
    doc.startViewTransition(update)
  } else {
    update()
  }
}

// Le quantità contano davvero da un valore all'altro invece di sostituire il testo di scatto:
// impercettibile per un singolo click, ma un clic rapido e ripetuto si vede scorrere invece di
// saltare — la differenza tra un modulo che reagisce e un modulo che sembra vivo.
function useTweenedNumber(target: number, duration = 220) {
  const [display, setDisplay] = useState(target)
  // Riflette sempre l'ultimo valore effettivamente mostrato, anche a metà di un tween
  // interrotto da un nuovo click: la prossima animazione riparte da lì, mai da un punto di
  // partenza ormai superato (la causa di un salto visibile, o peggio di un numero fuori range,
  // durante un doppio click veloce).
  const displayRef = useRef(target)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(target)
      return
    }
    const from = displayRef.current
    if (from === target) return
    const start = performance.now()
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
    let raf = 0

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const next = Math.round(from + (target - from) * easeOutCubic(t))
      displayRef.current = next
      setDisplay(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

const priceFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function formatPrice(value: number) {
  return priceFormatter.format(value)
}

interface QuantityStepperProps {
  value: number
  onDecrement: () => void
  onIncrement: () => void
  decrementLabel: string
  incrementLabel: string
}

function QuantityStepper({ value, onDecrement, onIncrement, decrementLabel, incrementLabel }: QuantityStepperProps) {
  const displayValue = useTweenedNumber(value)
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.stepperButton}
        onClick={onDecrement}
        disabled={value === 0}
        aria-label={decrementLabel}
      >
        <MinusIcon className={styles.stepperIcon} />
      </button>
      <span className={`${styles.stepperValue} mono-figure`} aria-live="polite">
        {displayValue}
      </span>
      <button type="button" className={styles.stepperButton} onClick={onIncrement} aria-label={incrementLabel}>
        <PlusIcon className={styles.stepperIcon} />
      </button>
    </div>
  )
}

export function Shop() {
  const [quantities, setQuantities] = useState<Quantities>({})
  const [fulfillment, setFulfillment] = useState<Fulfillment>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const selections = shopCatalog.flatMap((product) =>
    product.variants
      .filter((variant) => (quantities[variant.id] ?? 0) > 0)
      .map((variant) => ({ product, variant, quantity: quantities[variant.id] })),
  )
  const hasSelection = selections.length > 0
  const total = selections.reduce((sum, s) => sum + s.variant.price * s.quantity, 0)

  function adjustQuantity(variantId: string, delta: number) {
    setQuantities((prev) => ({ ...prev, [variantId]: Math.max(0, Math.min(20, (prev[variantId] ?? 0) + delta)) }))
    if (delta > 0) setErrors((prev) => (prev.selection ? { ...prev, selection: undefined } : prev))
  }

  function clearQuantity(variantId: string) {
    withViewTransition(() => setQuantities((prev) => ({ ...prev, [variantId]: 0 })))
  }

  function selectFulfillment(id: 'spedizione' | 'ritiro') {
    withViewTransition(() => {
      setFulfillment(id)
      setErrors((prev) => (prev.fulfillment ? { ...prev, fulfillment: undefined } : prev))
    })
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!hasSelection) next.selection = shop.selectionErrorLabel
    if (!fulfillment) next.fulfillment = shop.fulfillmentErrorLabel
    if (!name.trim()) next.name = shop.nameErrorLabel
    if (!email.trim() || !email.includes('@')) next.email = shop.emailErrorLabel
    if (fulfillment === 'spedizione' && !address.trim()) next.address = shop.addressErrorLabel
    return next
  }

  function buildMailtoHref() {
    const subject = encodeURIComponent('Richiesta ordine: Le Quote')
    const lines = [
      'Prodotti richiesti:',
      ...selections.map(
        (s) =>
          `- ${s.product.name}, ${s.variant.label} × ${s.quantity} (${formatPrice(s.variant.price * s.quantity)})`,
      ),
      `Totale: ${formatPrice(total)}`,
      '',
    ]
    if (fulfillment) {
      lines.push(`Consegna: ${fulfillment === 'spedizione' ? 'Spedizione' : 'Ritiro in azienda'}`)
    }
    if (fulfillment === 'spedizione' && address.trim()) lines.push(`Indirizzo: ${address.trim()}`)
    lines.push('', `Nome: ${name.trim()}`, `Email: ${email.trim()}`)
    if (phone.trim()) lines.push(`Telefono: ${phone.trim()}`)
    if (note.trim()) lines.push('', `Note: ${note.trim()}`)
    const body = encodeURIComponent(lines.join('\n'))
    return `mailto:${shop.fallbackEmail}?subject=${subject}&body=${body}`
  }

  function handleSubmit(event: MouseEvent<HTMLAnchorElement>) {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      event.preventDefault()
      setErrors(validationErrors)
      return
    }
    setErrors({})
    withViewTransition(() => setSubmitted(true))
  }

  return (
    <section id="shop" data-surface="dark" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.heading}>
          <SectionHeading title={shop.title} subtitle={shop.intro} visible />
        </Reveal>

        {/* Fase 1: cosa desideri */}
        <div className={styles.phase}>
          <Reveal offset={8} className={styles.catalog}>
            {shopCatalog.map((product) => (
              // Ogni linea di prodotto porta il proprio accento già stabilito altrove nel sito
              // (oliva per l'olio, miele per il miele) invece del miele fisso per tutto: stessa
              // disciplina dei due accenti, usata qui per distinguere le due linee a colpo
              // d'occhio. Riservato a colore statico (prezzo, sfondo del segnaposto), mai a
              // stati interattivi — l'accento miele resta l'unico colore "cliccabile" del sito.
              <div
                key={product.id}
                className={styles.product}
                style={
                  {
                    '--product-accent': product.id === 'olio' ? 'var(--color-oliva)' : 'var(--color-miele-tint)',
                  } as CSSProperties
                }
              >
                <div className={styles.productHeading}>
                  <span className="display-3">{product.name}</span>
                  <p className={`${styles.productNote} body-sm`}>{product.note}</p>
                </div>

                {/* Griglia a riflusso: un formato in più (o un prodotto in più, sopra) si
                    aggiunge senza dover ridisegnare le colonne. */}
                <motion.div
                  className={styles.variantGrid}
                  initial="hidden"
                  whileInView="visible"
                  viewport={REVEAL_VIEWPORT}
                  variants={staggerParent(0.1, 0.2)}
                >
                  {product.variants.map((variant) => (
                    <motion.div
                      key={variant.id}
                      className={styles.variantCard}
                      variants={riseChild}
                      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                    >
                      {/* Spike: i due formati disegnati usano l'illustrazione animata al posto della foto. */}
                      {variant.id === 'olio-750ml' ? (
                        <div className={styles.illustration}>
                          <OilBottle label={variant.imageLabel} />
                        </div>
                      ) : variant.id === 'miele-500g' ? (
                        <div className={styles.illustration}>
                          <HoneyJar label={variant.imageLabel} />
                        </div>
                      ) : (
                        <ImagePlaceholder
                          label={variant.imageLabel}
                          aspectRatio="1 / 1"
                          variant={product.id === 'olio' ? 'oliva' : 'miele'}
                          src={variant.image}
                          fit="cover"
                        />
                      )}
                      <div className={styles.variantCardBody}>
                        <span className="body">{variant.label}</span>
                        <span className={`${styles.variantPrice} mono-figure`}>{formatPrice(variant.price)}</span>
                        <QuantityStepper
                          value={quantities[variant.id] ?? 0}
                          onDecrement={() => adjustQuantity(variant.id, -1)}
                          onIncrement={() => adjustQuantity(variant.id, 1)}
                          decrementLabel={`Diminuisci quantità: ${product.name}, ${variant.label}`}
                          incrementLabel={`Aumenta quantità: ${product.name}, ${variant.label}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </Reveal>

          {hasSelection && (
            <div className={styles.summary}>
              <span className={`${styles.summaryTitle} mono-label`}>La tua richiesta</span>
              <ul className={styles.summaryList}>
                {selections.map((s) => (
                  <li key={s.variant.id} className={styles.summaryItem}>
                    <span className="body-sm">
                      {s.product.name}, {s.variant.label} × {s.quantity}
                    </span>
                    <div className={styles.summaryItemMeta}>
                      <span className="mono-figure">{formatPrice(s.variant.price * s.quantity)}</span>
                      <button
                        type="button"
                        className={`${styles.summaryRemove} mono-label`}
                        onClick={() => clearQuantity(s.variant.id)}
                      >
                        Rimuovi
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles.summaryTotal}>
                <span className="body-sm">Totale</span>
                <span className="mono-figure">{formatPrice(total)}</span>
              </div>
            </div>
          )}
          {errors.selection && (
            <p className={`${styles.errorText} body-sm`} role="alert">
              {errors.selection}
            </p>
          )}
        </div>

        {/* Fase 2: come lo ricevi */}
        <div className={styles.phase}>
          <Reveal offset={16} className={styles.fulfillment}>
            <span className={`${styles.fieldLabel} mono-label`}>{shop.fulfillmentLabel}</span>
            <div className={styles.fulfillmentOptions}>
              {shop.fulfillmentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={[styles.fulfillmentOption, fulfillment === option.id ? styles.fulfillmentOptionActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectFulfillment(option.id)}
                  aria-pressed={fulfillment === option.id}
                >
                  <span className="body">{option.label}</span>
                  <span className={`${styles.fulfillmentNote} body-sm`}>{option.note}</span>
                </button>
              ))}
            </div>
          </Reveal>
          {errors.fulfillment && (
            <p className={`${styles.errorText} body-sm`} role="alert">
              {errors.fulfillment}
            </p>
          )}

          {fulfillment === 'spedizione' && (
            <div className={`${styles.field} ${styles.fieldReveal}`}>
              <label className={`${styles.fieldLabel} mono-label`} htmlFor="shop-address">
                {shop.addressLabel}
              </label>
              <textarea
                id="shop-address"
                className={styles.textarea}
                value={address}
                onChange={(event) => {
                  const value = event.target.value
                  setAddress(value)
                  if (errors.address && value.trim()) setErrors((prev) => ({ ...prev, address: undefined }))
                }}
                rows={2}
                placeholder={shop.addressPlaceholder}
              />
              {errors.address && (
                <p className={`${styles.errorText} body-sm`} role="alert">
                  {errors.address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Fase 3: i tuoi dati */}
        <Reveal offset={24} className={styles.phase}>
          <span className={`${styles.fieldLabel} mono-label`}>{shop.formPhaseLabel}</span>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={`${styles.fieldLabel} mono-label`} htmlFor="shop-name">
                {shop.nameLabel}
              </label>
              <input
                id="shop-name"
                type="text"
                className={styles.input}
                value={name}
                onChange={(event) => {
                  const value = event.target.value
                  setName(value)
                  if (errors.name && value.trim()) setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                autoComplete="name"
              />
              {errors.name && (
                <p className={`${styles.errorText} body-sm`} role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={`${styles.fieldLabel} mono-label`} htmlFor="shop-email">
                {shop.emailLabel}
              </label>
              <input
                id="shop-email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(event) => {
                  const value = event.target.value
                  setEmail(value)
                  if (errors.email && value.trim() && value.includes('@')) {
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                autoComplete="email"
              />
              {errors.email && (
                <p className={`${styles.errorText} body-sm`} role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={`${styles.fieldLabel} mono-label`} htmlFor="shop-phone">
                {shop.phoneLabel}
              </label>
              <input
                id="shop-phone"
                type="tel"
                className={styles.input}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={`${styles.fieldLabel} mono-label`} htmlFor="shop-note">
              {shop.noteLabel}
            </label>
            <textarea
              id="shop-note"
              className={styles.textarea}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
          </div>
        </Reveal>

        {/* Fase 4: invio */}
        <div className={styles.phase}>
          {!submitted ? (
            <div className={styles.submitBlock}>
              <a href={buildMailtoHref()} onClick={handleSubmit} className={`${styles.cta} mono-label`}>
                {shop.ctaLabel}
              </a>
              <p className={`${styles.ctaHelp} body-sm`}>{shop.ctaHelp}</p>
            </div>
          ) : (
            <div className={styles.confirmation} role="status">
              <span className="display-3">{shop.confirmationTitle}</span>
              <p className="body">
                {shop.confirmationBody}{' '}
                <a href={`mailto:${shop.fallbackEmail}`} className={styles.confirmationLink}>
                  {shop.fallbackEmail}
                </a>
                .
              </p>
              <div className={styles.confirmationSummary}>
                <span className={`${styles.summaryTitle} mono-label`}>{shop.confirmationSummaryLabel}</span>
                <ul className={styles.summaryList}>
                  {selections.map((s) => (
                    <li key={s.variant.id} className={styles.summaryItem}>
                      <span className="body-sm">
                        {s.product.name}, {s.variant.label} × {s.quantity}
                      </span>
                      <span className={`${styles.summaryItemPrice} mono-figure`}>
                        {formatPrice(s.variant.price * s.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className={styles.summaryTotal}>
                  <span className="body-sm">Totale</span>
                  <span className="mono-figure">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
