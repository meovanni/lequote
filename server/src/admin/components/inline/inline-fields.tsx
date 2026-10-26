import { clx } from '@medusajs/ui'
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'

// Campi modificabili sul posto, come InlineNumber della pagina Gestione: sembrano testo, al clic
// diventano un campo, si salvano uscendo dal campo o con Invio (Esc annulla). Niente pulsanti
// "Salva" per i dati semplici.

const FIELD = clx(
  'txt-compact-small w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1 text-ui-fg-base outline-none transition-colors',
  'placeholder:text-ui-fg-muted hover:border-ui-border-base focus:border-ui-border-interactive focus:bg-ui-bg-field',
)

type InlineTextProps = {
  value: string | null | undefined
  label: string
  onSave: (value: string | null) => void
  type?: 'text' | 'date' | 'email' | 'tel'
  placeholder?: string
  /** Non si può lasciare vuoto (es. il nome): un campo svuotato torna al valore di prima. */
  required?: boolean
  multiline?: boolean
  className?: string
}

export function InlineText({ value, label, onSave, type = 'text', placeholder = '-', required = false, multiline = false, className }: InlineTextProps) {
  const current = value ?? ''
  const [text, setText] = useState(current)
  useEffect(() => setText(current), [current])

  const commit = () => {
    const next = text.trim()
    if (next === current.trim()) return
    if (required && next === '') {
      setText(current)
      return
    }
    onSave(next === '' ? null : next)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (!multiline || !event.shiftKey)) {
      event.preventDefault()
      event.currentTarget.blur()
    }
    if (event.key === 'Escape') {
      setText(current)
      const target = event.currentTarget
      requestAnimationFrame(() => target.blur())
    }
  }

  return multiline ? (
    <textarea
      aria-label={label}
      value={text}
      rows={2}
      placeholder={placeholder}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={clx(FIELD, 'resize-y', className)}
    />
  ) : (
    <input
      aria-label={label}
      type={type}
      value={text}
      placeholder={placeholder}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={clx(FIELD, className)}
    />
  )
}

type InlineSelectProps = {
  value: string | null
  label: string
  options: { value: string; label: string }[]
  /** Voce per "nessuno": se manca, la scelta è obbligatoria. */
  emptyLabel?: string
  onSave: (value: string | null) => void
}

/** Tendina che salva appena si sceglie. */
export function InlineSelect({ value, label, options, emptyLabel, onSave }: InlineSelectProps) {
  return (
    <select
      aria-label={label}
      value={value ?? ''}
      onChange={(event) => onSave(event.target.value === '' ? null : event.target.value)}
      className={clx(FIELD, 'cursor-pointer pr-6')}
    >
      {(emptyLabel !== undefined || value === null) && <option value="">{emptyLabel ?? 'Scegli…'}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

/** Etichetta e campo in colonna, per le schede aperte sotto una riga. */
export function Labeled({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="txt-compact-xsmall px-2 text-ui-fg-subtle">{label}</span>
      {children}
      {hint && <span className="txt-compact-xsmall px-2 text-ui-fg-muted">{hint}</span>}
    </div>
  )
}

type SegmentedProps<T extends string> = {
  value: T
  options: { value: T; label: string; count?: number }[]
  onChange: (value: T) => void
  label: string
}

/** Scelta della vista a pulsanti affiancati: sempre in vista, un clic, nessuna pagina nuova. */
export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="flex flex-wrap rounded-lg bg-ui-bg-component p-0.5" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={clx(
            'txt-compact-small-plus rounded-md px-3 py-1.5 transition-colors',
            value === option.value ? 'bg-ui-bg-base text-ui-fg-base shadow-borders-base' : 'text-ui-fg-subtle hover:text-ui-fg-base',
          )}
        >
          {option.label}
          {option.count !== undefined && <span className="lq-figure text-ui-fg-muted"> {option.count}</span>}
        </button>
      ))}
    </div>
  )
}
