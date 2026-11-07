import { clx } from '@medusajs/ui'
import { useEffect, useState, type KeyboardEvent } from 'react'

// Campo di testo del sito, modificabile sul posto come i campi della pagina Gestione: si salva
// uscendo dal campo o con Invio (Maiusc+Invio va a capo nei testi lunghi), Esc annulla. Svuotato,
// torna al testo di partenza.

const FIELD = clx(
  'txt-compact-small w-full min-w-0 resize-y rounded-md border bg-transparent px-2 py-1.5 text-ui-fg-base outline-none transition-colors',
  'hover:border-ui-border-interactive focus:border-ui-border-interactive focus:bg-ui-bg-field',
)

type ContentTextProps = {
  value: string
  label: string
  multiline: boolean
  /** Modificato rispetto al testo di partenza: bordo pieno e colorato. */
  modified: boolean
  disabled?: boolean
  onSave: (value: string | null) => void
}

/** Righe iniziali secondo la lunghezza, così un paragrafo si legge senza scorrere. */
const rowsFor = (text: string) => Math.min(12, Math.max(2, Math.ceil(text.length / 70) + (text.match(/\n/g)?.length ?? 0)))

export function ContentText({ value, label, multiline, modified, disabled = false, onSave }: ContentTextProps) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])

  const commit = () => {
    const next = multiline ? text.trim() : text.replace(/\s+/g, ' ').trim()
    if (next === value.trim()) return
    onSave(next === '' ? null : next)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (!multiline || !event.shiftKey)) {
      event.preventDefault()
      event.currentTarget.blur()
    }
    if (event.key === 'Escape') {
      setText(value)
      const target = event.currentTarget
      requestAnimationFrame(() => target.blur())
    }
  }
  const className = clx(FIELD, modified ? 'border-ui-tag-orange-border bg-ui-tag-orange-bg/30' : 'border-dashed border-ui-border-base')

  return multiline ? (
    <textarea
      aria-label={label}
      value={text}
      rows={rowsFor(value)}
      disabled={disabled}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={className}
    />
  ) : (
    <input
      aria-label={label}
      value={text}
      disabled={disabled}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={className}
    />
  )
}
