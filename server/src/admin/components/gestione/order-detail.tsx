import { Button, Text } from '@medusajs/ui'
import { Link } from 'react-router-dom'
import type { FormatRow, GestioneOrder } from '../../lib/gestione-api'
import { useSalesAction } from '../../lib/sales-api'
import { InlineText, Labeled } from '../inline/inline-fields'
import { LinesEditor } from '../sales/lines-editor'
import { PaymentsEditor } from '../sales/payments-editor'
import { DdtPanel } from '../documenti/ddt-panel'
import { documentPdfUrl, refLabel } from '../../lib/documenti-api'

// Il dettaglio di un ordine si apre sotto la sua riga: dati del cliente modificabili sul posto,
// prodotti (anche da aggiungere), incassi correggibili. Niente scheda a parte.

export function OrderDetail({ order, formats }: { order: GestioneOrder; formats: FormatRow[] }) {
  const action = useSalesAction()
  const path = `/admin/backoffice/orders/${order.id}`
  const open = order.status !== 'canceled'
  const insertedBy = order.insertedBy ? `${order.insertedBy.name} (${order.insertedBy.type === 'agente' ? 'agente' : 'back office'})` : 'Sito'
  const save = (body: Record<string, unknown>, success = 'Salvato.') => action.mutate({ path, body, success })
  const saveCustomer = (key: string, value: string | null) => save({ customer: { [key]: value } }, 'Dati del cliente salvati.')

  return (
    <div className="grid grid-cols-1 gap-6 bg-ui-bg-subtle px-6 py-4 lg:grid-cols-3">
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 self-start">
        <Labeled label="Nome">
          <InlineText value={order.customerFields.first_name} label="Nome del cliente" onSave={(value) => saveCustomer('first_name', value)} />
        </Labeled>
        <Labeled label="Cognome">
          <InlineText value={order.customerFields.last_name} label="Cognome del cliente" onSave={(value) => saveCustomer('last_name', value)} />
        </Labeled>
        <Labeled label="Ragione sociale">
          <InlineText value={order.customerFields.company} label="Ragione sociale" onSave={(value) => saveCustomer('company', value)} />
        </Labeled>
        <Labeled label="Telefono">
          <InlineText type="tel" value={order.phone} label="Telefono del cliente" onSave={(value) => saveCustomer('phone', value)} />
        </Labeled>
        <div className="col-span-2">
          <Labeled label="Email">
            <InlineText type="email" value={order.email} label="Email del cliente" onSave={(email) => email && save({ email }, 'Email salvata.')} />
          </Labeled>
        </div>
        <div className="col-span-2">
          <Labeled label="Note">
            <InlineText multiline value={order.notes} label="Note dell’ordine" onSave={(notes) => save({ notes }, 'Note salvate.')} />
          </Labeled>
        </div>
        <Text size="xsmall" className="col-span-2 px-2 pt-1 text-ui-fg-muted">
          {order.delivery} · inserito da {insertedBy}
          {order.agent ? ` · agente ${order.agent}` : ''}
        </Text>
      </div>
      <LinesEditor
        key={JSON.stringify(order.lines)}
        lines={order.lines}
        editable={open && !order.delivered}
        path={path}
        options={formats.flatMap((format) =>
          format.variantId
            ? [{ variantId: format.variantId, label: `${format.line === 'olio' ? 'Olio' : 'Miele'}, ${format.label}`, unit: format.bulk ? (format.line === 'olio' ? 'L' : 'kg') : 'pz', price: format.price, available: format.available }]
            : [],
        )}
      />
      <div className="flex flex-col gap-4">
        <PaymentsEditor payments={order.payments} basePath={`${path}/payments`} editable={open} />
        <Button size="small" variant="transparent" className="self-start" asChild>
          <Link to={`/orders/${order.id}`}>Scheda completa di Medusa</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4 border-t border-ui-border-base pt-4 lg:col-span-3">
        <DdtPanel orderId={order.id} ddt={order.documents.ddt} canceled={!open} path={`/admin/gestione/orders/${order.id}/ddt`} canCancel />
        {order.documents.fattura && (
          <div className="flex flex-wrap items-center gap-2">
            <Text size="small" weight="plus">
              Fatturato:
            </Text>
            <Text size="small">{refLabel('fattura', order.documents.fattura)}</Text>
            <Button size="small" variant="secondary" asChild>
              <a href={documentPdfUrl(order.documents.fattura.id)} target="_blank" rel="noreferrer">
                Apri PDF
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
