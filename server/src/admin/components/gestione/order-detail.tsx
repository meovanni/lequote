import { Button, Text, usePrompt } from '@medusajs/ui'
import { Link } from 'react-router-dom'
import type { FormatRow, GestioneOrder } from '../../lib/gestione-api'
import { formatDay, formatEuro, PAYMENT_METHOD_LABEL, useOrderSales, useSalesAction } from '../../lib/sales-api'
import { LinesEditor } from '../sales/lines-editor'

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
      <LinesEditor
        key={JSON.stringify(order.lines)}
        lines={order.lines}
        editable={order.status !== 'canceled' && !order.delivered}
        path={`/admin/backoffice/orders/${order.id}`}
        options={formats.flatMap((format) =>
          format.variantId
            ? [{ variantId: format.variantId, label: `${format.line === 'olio' ? 'Olio' : 'Miele'}, ${format.label}`, unit: format.bulk ? (format.line === 'olio' ? 'L' : 'kg') : 'pz', price: format.price, available: format.available }]
            : [],
        )}
      />
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
