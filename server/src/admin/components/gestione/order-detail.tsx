import { Button, Text, usePrompt } from '@medusajs/ui'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormatRow, GestioneOrder } from '../../lib/gestione-api'
import { formatDay, formatEuro, PAYMENT_METHOD_LABEL, useOrderSales, useSalesAction } from '../../lib/sales-api'
import { InlineNumber } from './inline-number'

// Il dettaglio di un ordine si apre sotto la sua riga: dati del cliente, righe modificabili sul
// posto, incassi registrati. Niente scheda a parte.

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2">
      <Text size="small" className="text-ui-fg-subtle">{label}</Text>
      <Text size="small">{value}</Text>
    </div>
  )
}

function LinesEditor({ order, formats }: { order: GestioneOrder; formats: FormatRow[] }) {
  const action = useSalesAction()
  const editable = order.status !== 'canceled' && !order.delivered
  const original = Object.fromEntries(order.lines.filter((line) => line.variantId).map((line) => [line.variantId!, line.quantity]))
  const [quantities, setQuantities] = useState<Record<string, number>>(original)
  const changed = JSON.stringify(quantities) !== JSON.stringify(original)
  const addable = formats.filter((format) => format.variantId && format.price !== null && !(format.variantId in quantities))
  const formatOf = (variantId: string) => formats.find((format) => format.variantId === variantId)

  const save = () =>
    action.mutate({
      path: `/admin/backoffice/orders/${order.id}`,
      body: { items: Object.entries(quantities).map(([variant_id, quantity]) => ({ variant_id, quantity })) },
      success: 'Ordine aggiornato.',
    })

  return (
    <div className="flex flex-col gap-2">
      <Text size="small" weight="plus">Prodotti</Text>
      <ul className="flex flex-col gap-1">
        {Object.entries(quantities).map(([variantId, quantity]) => {
          const format = formatOf(variantId)
          const line = order.lines.find((entry) => entry.variantId === variantId)
          const unit = format?.bulk ? (format.line === 'olio' ? 'L' : 'kg') : 'pz'
          return (
            <li key={variantId} className="flex items-center justify-between gap-3">
              <Text size="small">{format?.label ?? line?.subtitle ?? line?.title}</Text>
              {editable ? (
                <InlineNumber value={quantity} suffix={unit} label={`Quantità di ${format?.label ?? 'prodotto'}`} onSave={(value) => setQuantities((current) => ({ ...current, [variantId]: value }))} />
              ) : (
                <Text size="small" className="lq-figure">{quantity} {unit}</Text>
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
              {addable.map((format) => (
                <option key={format.sku} value={format.variantId!}>
                  {format.line === 'olio' ? 'Olio' : 'Miele'}, {format.label}
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

function Payments({ orderId }: { orderId: string }) {
  const sales = useOrderSales(orderId)
  const payments = sales.data?.payments.payments ?? []
  return (
    <div className="flex flex-col gap-2">
      <Text size="small" weight="plus">Incassi</Text>
      {payments.length === 0 ? (
        <Text size="small" className="text-ui-fg-subtle">Nessun incasso registrato.</Text>
      ) : (
        <ul className="flex flex-col gap-1">
          {payments.map((payment) => (
            <li key={payment.id} className="flex justify-between gap-3">
              <Text size="small" className="text-ui-fg-subtle">
                {formatDay(payment.paid_at)}, {PAYMENT_METHOD_LABEL[payment.method].toLowerCase()}, {payment.recorded_by_name}
              </Text>
              <Text size="small" className="lq-figure">{formatEuro(Number(payment.amount))}</Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function OrderDetail({ order, formats }: { order: GestioneOrder; formats: FormatRow[] }) {
  const action = useSalesAction()
  const prompt = usePrompt()
  const insertedBy = order.insertedBy ? `${order.insertedBy.name} (${order.insertedBy.type === 'agente' ? 'agente' : 'back office'})` : 'Sito'

  const cancel = async () => {
    const confirmed = await prompt({
      title: `Annullare l'ordine n. ${order.displayId}?`,
      description: 'La merce torna disponibile. Gli incassi registrati restano da restituire a mano.',
      confirmText: 'Annulla l’ordine',
      cancelText: 'Lascia così',
    })
    if (confirmed) action.mutate({ path: `/admin/orders/${order.id}/cancel`, success: 'Ordine annullato.' })
  }

  return (
    <div className="grid grid-cols-1 gap-6 bg-ui-bg-subtle px-6 py-4 lg:grid-cols-3">
      <div className="flex flex-col gap-1">
        <Fact label="Telefono" value={order.phone} />
        <Fact label="Email" value={order.email} />
        <Fact label="Consegna" value={order.delivery} />
        <Fact label="Inserito da" value={insertedBy} />
        <Fact label="Agente" value={order.agent} />
        <Fact label="Note" value={order.notes} />
      </div>
      <LinesEditor key={JSON.stringify(order.lines)} order={order} formats={formats} />
      <div className="flex flex-col gap-4">
        <Payments orderId={order.id} />
        <div className="flex flex-wrap gap-2">
          <Button size="small" variant="transparent" asChild>
            <Link to={`/orders/${order.id}`}>Scheda completa</Link>
          </Button>
          {order.status !== 'canceled' && !order.delivered && (
            <Button size="small" variant="transparent" className="text-ui-fg-error" onClick={() => void cancel()}>
              Annulla ordine
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
