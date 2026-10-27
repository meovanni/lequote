import { Text } from '@medusajs/ui'
import { formatEuro, useSalesAction, type BookingLine } from '../../lib/sales-api'
import { InlineNumber } from '../gestione/inline-number'

// I prodotti di un ordine direttamente nella riga: la quantità si cambia cliccando sul numero e si
// salva subito (0 toglie il prodotto). Per aggiungere prodotti si apre il dettaglio.

type InlineLinesProps = {
  lines: BookingLine[]
  /** Nome del prodotto e unità della quantità per una riga. */
  describe: (line: BookingLine) => { label: string; unit: string; perUnit?: string }
  editable: boolean
  /** Rotta che riceve { items }: /admin/backoffice/orders/:id o /admin/sell/bookings/:id. */
  path: string
}

export function InlineLines({ lines, describe, editable, path }: InlineLinesProps) {
  const action = useSalesAction()
  const save = (variantId: string, quantity: number) =>
    action.mutate({
      path,
      body: { items: lines.filter((line) => line.variantId).map((line) => ({ variant_id: line.variantId, quantity: line.variantId === variantId ? quantity : line.quantity })) },
      success: quantity === 0 ? 'Prodotto tolto dall’ordine.' : 'Quantità aggiornata.',
    })

  return (
    <ul className="flex flex-col">
      {lines.map((line) => {
        const { label, unit, perUnit } = describe(line)
        const price = `${formatEuro(line.unitPrice)}${perUnit ? `/${perUnit}` : ''}`
        return (
          <li key={line.id} className="flex flex-wrap items-baseline gap-x-1">
            {editable && line.variantId ? (
              <InlineNumber value={line.quantity} suffix={unit} label={`Quantità di ${label}`} saving={action.isPending} onSave={(value) => save(line.variantId!, value)} />
            ) : (
              <Text size="small" className="lq-figure">{line.quantity} {unit}</Text>
            )}
            <Text size="small" className="text-ui-fg-subtle">
              {label} <span className="text-ui-fg-muted">a {price}</span>
            </Text>
          </li>
        )
      })}
    </ul>
  )
}
