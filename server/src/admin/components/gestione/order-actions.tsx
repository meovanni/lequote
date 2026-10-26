import { Button, Text, usePrompt } from '@medusajs/ui'
import { useState } from 'react'
import { formatDay, formatEuro, PAYMENT_METHOD_LABEL, useSalesAction, type PaymentMethod } from '../../lib/sales-api'
import type { GestioneOrder } from '../../lib/gestione-api'

// Le due azioni di ogni giorno, direttamente nella riga dell'ordine: incassare e consegnare.

export function PaymentCell({ order }: { order: GestioneOrder }) {
  const action = useSalesAction()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('contanti')

  if (order.status === 'canceled') return <Text size="small" className="text-ui-fg-muted">-</Text>
  if (order.due <= 0) return <Text size="small" className="text-ui-fg-subtle">Saldato</Text>
  if (!open) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Text size="small" className="lq-figure text-ui-tag-orange-text">{formatEuro(order.due)}</Text>
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setAmount(order.due.toFixed(2).replace('.', ','))
            setOpen(true)
          }}
        >
          Incassa
        </Button>
      </div>
    )
  }

  const value = Number(amount.replace(',', '.'))
  const valid = value > 0 && value <= order.due + 0.001
  return (
    <form
      className="flex items-center justify-end gap-1"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        action.mutate(
          { path: `/admin/backoffice/orders/${order.id}/payments`, body: { amount: value, method }, success: `Incassati ${formatEuro(value)}.` },
          { onSuccess: () => setOpen(false) },
        )
      }}
    >
      <input
        aria-label="Importo incassato"
        inputMode="decimal"
        autoFocus
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
        className="lq-figure w-20 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 text-right outline-none focus:border-ui-border-interactive"
      />
      <select
        aria-label="Mezzo di pagamento"
        value={method}
        onChange={(event) => setMethod(event.target.value as PaymentMethod)}
        className="txt-compact-small rounded-md border border-ui-border-base bg-ui-bg-field px-1 py-1"
      >
        {Object.entries(PAYMENT_METHOD_LABEL).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <Button size="small" type="submit" disabled={!valid} isLoading={action.isPending}>
        Ok
      </Button>
      <Button size="small" variant="transparent" type="button" onClick={() => setOpen(false)}>
        Annulla
      </Button>
    </form>
  )
}

export function DeliveryCell({ order }: { order: GestioneOrder }) {
  const action = useSalesAction()
  const prompt = usePrompt()

  if (order.status === 'canceled') return <Text size="small" className="text-ui-fg-muted">Annullato</Text>
  if (order.delivered) {
    const undo = async () => {
      const confirmed = await prompt({
        title: 'Annullare la consegna?',
        description: `La merce dell'ordine n. ${order.displayId} torna in magazzino e l'ordine torna da consegnare.`,
        confirmText: 'Annulla la consegna',
        cancelText: 'Lascia così',
      })
      if (confirmed) action.mutate({ path: `/admin/gestione/orders/${order.id}/deliver`, method: 'DELETE', success: 'Consegna annullata: la merce è tornata in magazzino.' })
    }
    return (
      <div className="flex items-center justify-end gap-2">
        <Text size="small" className="text-ui-fg-subtle">Consegnato il {formatDay(order.delivered.at)}</Text>
        <Button size="small" variant="transparent" onClick={() => void undo()}>
          Annulla
        </Button>
      </div>
    )
  }
  return (
    <div className="flex justify-end">
      <Button
        size="small"
        variant="secondary"
        isLoading={action.isPending}
        onClick={() => action.mutate({ path: `/admin/gestione/orders/${order.id}/deliver`, success: `Ordine n. ${order.displayId} consegnato: merce scalata dal magazzino.` })}
      >
        Consegnato
      </Button>
    </div>
  )
}
