import { Minus, Plus } from '@medusajs/icons'
import { clx, IconButton, Input, Text } from '@medusajs/ui'
import { formatEuro, type Variant } from '../../lib/sales-api'
import { maxFor, stockLabel } from './stock-label'

type ProductPickerProps = {
  variants: Variant[]
  quantities: Record<string, string>
  onChange: (variantId: string, quantity: string) => void
}

/**
 * Righe dei formati vendibili con quantità a pulsanti; la riga scelta si evidenzia. Il massimo è
 * quanto si può riservare per un ordine: oltre, la riga lo segnala e il modulo non parte.
 */
export function ProductPicker({ variants, quantities, onChange }: ProductPickerProps) {
  return (
    <ul className="flex flex-col gap-2">
      {variants.map((variant) => {
        const quantity = Number(quantities[variant.variantId] || 0)
        const max = maxFor(variant) ?? Infinity
        const unavailable = variant.price === null || max <= 0
        const over = quantity > max
        const label = `${variant.product}, ${variant.variant}`
        const step = (delta: number) => onChange(variant.variantId, String(Math.min(max, Math.max(0, quantity + delta))))
        return (
          <li
            key={variant.variantId}
            className={clx(
              'grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3 transition-colors sm:grid-cols-[1fr_auto_5.5rem]',
              over ? 'border-ui-border-error bg-ui-bg-base' : quantity > 0 ? 'border-ui-border-interactive bg-ui-bg-highlight' : 'border-ui-border-base bg-ui-bg-base',
            )}
          >
            <div className="min-w-0">
              <Text size="small" weight="plus">
                {label}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {variant.price === null ? 'Prezzo non impostato' : formatEuro(variant.price)}
                {stockLabel(variant) ? `, ${stockLabel(variant)}` : ''}
              </Text>
              {over && (
                <Text size="xsmall" className="text-ui-fg-error">
                  Disponibili solo {max}.
                </Text>
              )}
            </div>
            <div className="flex items-center gap-1">
              <IconButton type="button" size="small" variant="transparent" aria-label={`Togli una unità di ${label}`} disabled={unavailable || quantity === 0} onClick={() => step(-1)}>
                <Minus />
              </IconButton>
              <Input
                aria-label={`Quantità di ${label}`}
                type="number"
                size="small"
                min={0}
                max={Number.isFinite(max) ? max : undefined}
                aria-invalid={over}
                className="lq-figure w-14 text-center"
                value={quantities[variant.variantId] ?? ''}
                placeholder="0"
                disabled={unavailable}
                onChange={(event) => onChange(variant.variantId, event.target.value)}
              />
              <IconButton type="button" size="small" variant="transparent" aria-label={`Aggiungi una unità di ${label}`} disabled={unavailable || quantity >= max} onClick={() => step(1)}>
                <Plus />
              </IconButton>
            </div>
            <Text size="small" weight="plus" className={clx('lq-figure col-span-2 text-right sm:col-span-1', quantity === 0 && 'hidden sm:block')}>
              {quantity > 0 && variant.price !== null ? formatEuro(variant.price * quantity) : ''}
            </Text>
          </li>
        )
      })}
    </ul>
  )
}
