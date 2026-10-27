import { clx } from '@medusajs/ui'
import { useEffect, useState, type KeyboardEvent } from 'react'

type InlineNumberProps = {
  value: number | null
  /** Etichetta per i lettori di schermo, es. "Bottiglie pronte". */
  label: string
  /** Unità mostrata accanto al numero: "L", "pz", "€". */
  suffix?: string
  decimals?: boolean
  /** Importi in euro: sempre con due decimali (12,90). */
  money?: boolean
  onSave: (value: number) => void
  saving?: boolean
}

// Virgola o punto come decimali: "12,5" e "12.5" valgono uguale.
const parse = (text: string) => Number(text.trim().replace(',', '.'))
const show = (value: number | null, money = false) => (value === null ? '' : (money ? value.toFixed(2) : String(value)).replace('.', ','))

/**
 * Numero modificabile sul posto: sembra un testo, al clic diventa un campo. Si salva uscendo dal
 * campo o con Invio; Esc annulla. Niente pulsanti "Salva": la modifica è il gesto stesso.
 */
export function InlineNumber({ value, label, suffix, decimals = false, money = false, onSave, saving = false }: InlineNumberProps) {
  const [text, setText] = useState(show(value, money))
  useEffect(() => setText(show(value, money)), [value, money])

  const parsed = parse(text)
  const valid = text.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && (decimals || Number.isInteger(parsed))
  const changed = valid && parsed !== value

  const commit = () => {
    if (changed) onSave(parsed)
    else setText(show(value, money))
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
    if (event.key === 'Escape') {
      setText(show(value, money))
      requestAnimationFrame(() => (event.target as HTMLInputElement).blur())
    }
  }

  return (
    <label className="inline-flex items-baseline gap-1">
      <span className="sr-only">{label}</span>
      <input
        inputMode={decimals ? 'decimal' : 'numeric'}
        value={text}
        aria-invalid={!valid && text.trim() !== ''}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onFocus={(event) => event.target.select()}
        disabled={saving}
        className={clx(
          'lq-figure w-20 rounded-md border border-transparent bg-transparent px-2 py-1 text-right text-ui-fg-base outline-none transition-colors',
          'hover:border-ui-border-base focus:border-ui-border-interactive focus:bg-ui-bg-field',
          'aria-[invalid=true]:border-ui-border-error',
          saving && 'opacity-50',
        )}
      />
      {suffix && <span className="txt-compact-small text-ui-fg-subtle">{suffix}</span>}
    </label>
  )
}
