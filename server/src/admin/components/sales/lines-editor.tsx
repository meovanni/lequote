import { Button, Text } from '@medusajs/ui'
import { useState } from 'react'
import { useSalesAction, type BookingLine } from '../../lib/sales-api'
import { InlineNumber } from '../gestione/inline-number'

// Prodotti di un ordine aperto, modificabili sul posto: quantità cliccando sul numero (0 toglie la
// riga), prodotti in più dalla tendina. Le modifiche si salvano insieme, con un pulsante che
// compare solo quando c'è qualcosa da salvare. Lo usano la pagina Gestione e l'area vendita.

export type LineOption = { variantId: string; label: string; unit: 'pz' | 'L' | 'kg'; price: number | null; available: number | null }

type LinesEditorProps = {
  lines: BookingLine[]
  options: LineOption[]
  editable: boolean
  /** Rotta che riceve { items }: /admin/backoffice/orders/:id o /admin/sell/bookings/:id. */
  path: string
}

export function LinesEditor({ lines, options, editable, path }: LinesEditorProps) {
  const action = useSalesAction()
  const original = Object.fromEntries(lines.filter((line) => line.variantId).map((line) => [line.variantId!, line.quantity]))
  const [quantities, setQuantities] = useState<Record<string, number>>(original)
  const changed = JSON.stringify(quantities) !== JSON.stringify(original)
  const optionOf = (variantId: string) => options.find((option) => option.variantId === variantId)
  const addable = options.filter((option) => option.price !== null && !(option.variantId in quantities) && option.available !== 0)

  const save = () =>
    action.mutate({
      path,
      body: { items: Object.entries(quantities).map(([variant_id, quantity]) => ({ variant_id, quantity })) },
      success: 'Prodotti aggiornati.',
    })

  return (
    <div className="flex flex-col gap-2">
      <Text size="small" weight="plus">Prodotti</Text>
      <ul className="flex flex-col gap-1">
        {Object.entries(quantities).map(([variantId, quantity]) => {
          const option = optionOf(variantId)
          const line = lines.find((entry) => entry.variantId === variantId)
          const label = option?.label ?? (line ? `${line.title}, ${line.subtitle}` : 'Prodotto')
          return (
            <li key={variantId} className="flex items-center justify-between gap-3">
              <Text size="small">{label}</Text>
              {editable ? (
                <InlineNumber value={quantity} suffix={option?.unit ?? 'pz'} label={`Quantità di ${label}`} onSave={(value) => setQuantities((current) => ({ ...current, [variantId]: value }))} />
              ) : (
                <Text size="small" className="lq-figure">{quantity} {option?.unit ?? 'pz'}</Text>
              )}
            </li>
          )
        })}
      </ul>
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          {addable.length > 0 && (
            <select
              aria-label="Aggiungi un prodotto"
              value=""
              onChange={(event) => event.target.value && setQuantities((current) => ({ ...current, [event.target.value]: 1 }))}
              className="txt-compact-small rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1"
            >
              <option value="">+ Aggiungi prodotto</option>
              {addable.map((option) => (
                <option key={option.variantId} value={option.variantId}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {changed && (
            <>
              <Button size="small" onClick={save} isLoading={action.isPending}>
                Salva prodotti
              </Button>
              <Button size="small" variant="transparent" onClick={() => setQuantities(original)}>
                Annulla
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
