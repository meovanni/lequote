import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useContent } from '@/i18n/LocaleContext'
import { parseLotCode } from '@/lib/lotCode'
import styles from './Filiera.module.css'

type LookupState =
  { kind: 'idle' } | { kind: 'error'; message: string; attempt: number } | { kind: 'pending'; code: string }

export function LotLookup() {
  const { lookup } = useContent().filiera
  const [value, setValue] = useState('')
  const [state, setState] = useState<LookupState>({ kind: 'idle' })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputId = useId()
  const helpId = useId()
  const errorId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = parseLotCode(value)
    if (!result.ok) {
      const message = result.reason === 'empty' ? lookup.emptyError : lookup.formatError
      // attempt cambia a ogni invio: rimonta l'avviso, così viene riletto anche se identico.
      setState((prev) => ({
        kind: 'error',
        message,
        attempt: prev.kind === 'error' ? prev.attempt + 1 : 0,
      }))
      inputRef.current?.focus()
      return
    }
    setValue(result.code)
    setState({ kind: 'pending', code: result.code })
  }

  const hasError = state.kind === 'error'
  const describedBy = [helpId, hasError ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={styles.lookup}>
      <form className={styles.lookupForm} onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className={`${styles.lookupLabel} display-3`}>
          {lookup.label}
        </label>
        <div className={styles.lookupRow}>
          <input
            ref={inputRef}
            id={inputId}
            className={`${styles.lookupInput} mono-figure`}
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={32}
            placeholder={lookup.placeholder}
            value={value}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            onChange={(event) => {
              setValue(event.target.value)
              // Un risultato o un errore valgono solo per il codice con cui sono nati.
              if (state.kind !== 'idle') setState({ kind: 'idle' })
            }}
          />
          <button type="submit" className="btn btn-primary mono-label">
            {lookup.submitLabel}
          </button>
        </div>
        <p id={helpId} className={`${styles.lookupHelp} body-sm`}>
          {lookup.help}
        </p>
        {state.kind === 'error' && (
          <p key={state.attempt} id={errorId} role="alert" className={`${styles.lookupError} body-sm`}>
            {state.message}
          </p>
        )}
      </form>

      {/* Regione di stato sempre montata: un live region creato già pieno spesso non viene
          annunciato. La consultazione per lotto arriva in Fase 3: fino ad allora la risposta
          dice onestamente come ottenere le informazioni, senza simulare un risultato. */}
      <div role="status" className={state.kind === 'pending' ? styles.lookupResult : undefined}>
        {state.kind === 'pending' && (
          <>
            <span className="specimen-tag specimen">{state.code}</span>
            <p className="display-3">{lookup.pendingTitle}</p>
            <p className="body">
              {lookup.pendingBody}{' '}
              <a
                className={styles.inlineLink}
                href={`mailto:${lookup.email}?subject=${encodeURIComponent(`Informazioni sul lotto ${state.code}`)}`}
              >
                {lookup.email}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
