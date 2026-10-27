import { ChevronDownMini, PencilSquare, Trash } from '@medusajs/icons'
import { Button, Container, Heading, IconButton, Input, Text, Tooltip, clx, usePrompt } from '@medusajs/ui'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { lineParts, type FormatRow, type GestioneOrder, type LineRow } from '../../lib/gestione-api'
import { formatDay, formatEuro, useBackofficeCatalog, useSalesAction } from '../../lib/sales-api'
import { BookingForm } from '../sales/booking-form'
import { InlineLines } from '../sales/inline-lines'
import { OrderImportModal } from '../sales/order-import-modal'
import { DeliveryCell, PaymentCell } from './order-actions'
import { OrderDetail } from './order-detail'

type Filter = 'consegnare' | 'incassare' | 'tutti'

const toDeliver = (order: GestioneOrder) => order.status !== 'canceled' && !order.delivered
const toCollect = (order: GestioneOrder) => order.status !== 'canceled' && order.due > 0

/** Modifica (apre il dettaglio sotto la riga) ed elimina (annulla l'ordine), sempre a portata di clic. */
function RowActions({ order, open, onToggle }: { order: GestioneOrder; open: boolean; onToggle: () => void }) {
  const action = useSalesAction()
  const prompt = usePrompt()
  const removable = order.status !== 'canceled' && !order.delivered
  const remove = async () => {
    const confirmed = await prompt({
      title: `Eliminare l'ordine n. ${order.code}?`,
      description: 'L’ordine resta nell’elenco come annullato e la merce torna disponibile. Gli incassi già registrati vanno restituiti a mano.',
      confirmText: 'Elimina l’ordine',
      cancelText: 'Lascia così',
    })
    if (confirmed) action.mutate({ path: `/admin/orders/${order.id}/cancel`, success: `Ordine n. ${order.code} eliminato (annullato).` })
  }
  return (
    <div className="flex justify-end gap-0.5">
      <Tooltip content={open ? 'Chiudi' : 'Modifica cliente, prodotti e incassi'}>
        <IconButton size="small" variant="transparent" aria-label={`${open ? 'Chiudi' : 'Modifica'} l’ordine ${order.code}`} aria-pressed={open} onClick={onToggle}>
          <PencilSquare />
        </IconButton>
      </Tooltip>
      {removable && (
        <Tooltip content="Elimina ordine">
          <IconButton size="small" variant="transparent" aria-label={`Elimina l’ordine ${order.code}`} onClick={() => void remove()} className="hover:text-ui-fg-error">
            <Trash />
          </IconButton>
        </Tooltip>
      )}
    </div>
  )
}

function NewOrder({ onDone }: { onDone: () => void }) {
  const catalog = useBackofficeCatalog()
  const action = useSalesAction()
  const ref = useRef<HTMLDivElement>(null)
  // Il modulo si apre sopra l'elenco: lo si porta in vista subito.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  return (
    <Container ref={ref} className="scroll-mt-4 px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <Heading level="h2">Nuovo ordine</Heading>
        <Button size="small" variant="transparent" onClick={onDone}>
          Chiudi
        </Button>
      </div>
      {catalog.data ? (
        <BookingForm
          catalog={catalog.data}
          showAgent
          submitting={action.isPending}
          submitLabel="Inserisci l’ordine"
          onSubmit={(body) => action.mutate({ path: '/admin/backoffice/orders', body, success: 'Ordine inserito.' }, { onSuccess: onDone })}
        />
      ) : (
        <div className="h-40 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
      )}
    </Container>
  )
}

export function OrdersPanel({ orders, formats, lines }: { orders: GestioneOrder[]; formats: FormatRow[]; lines: LineRow[] }) {
  const [filter, setFilter] = useState<Filter>('consegnare')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const counts = { consegnare: orders.filter(toDeliver).length, incassare: orders.filter(toCollect).length, tutti: orders.length }
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders
      .filter((order) => (filter === 'consegnare' ? toDeliver(order) : filter === 'incassare' ? toCollect(order) : true))
      .filter((order) => !term || order.customer.toLowerCase().includes(term) || order.code.toLowerCase().includes(term.replace('#', '')))
  }, [orders, filter, search])

  const tabs: { key: Filter; label: string }[] = [
    { key: 'consegnare', label: 'Da consegnare' },
    { key: 'incassare', label: 'Da incassare' },
    { key: 'tutti', label: 'Tutti' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {creating && <NewOrder onDone={() => setCreating(false)} />}
      <Container className="p-0">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <Heading level="h2" className="mr-2">Ordini</Heading>
          <div className="flex rounded-lg bg-ui-bg-component p-0.5" role="group" aria-label="Quali ordini">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-pressed={filter === tab.key}
                onClick={() => setFilter(tab.key)}
                className={clx(
                  'txt-compact-small-plus rounded-md px-3 py-1.5 transition-colors',
                  filter === tab.key ? 'bg-ui-bg-base text-ui-fg-base shadow-borders-base' : 'text-ui-fg-subtle hover:text-ui-fg-base',
                )}
              >
                {tab.label} <span className="lq-figure text-ui-fg-muted">{counts[tab.key]}</span>
              </button>
            ))}
          </div>
          <Input size="small" type="search" placeholder="Cerca cliente o codice" aria-label="Cerca cliente o codice" value={search} onChange={(event) => setSearch(event.target.value)} className="w-56" />
          <div className="ml-auto flex items-center gap-2">
            <OrderImportModal />
            <Button size="small" onClick={() => setCreating(true)} disabled={creating}>
              Nuovo ordine
            </Button>
          </div>
        </div>

        {visible.length === 0 ? (
          <Text size="small" className="border-t border-ui-border-base px-6 py-8 text-center text-ui-fg-subtle">
            {filter === 'consegnare' ? 'Niente da consegnare.' : filter === 'incassare' ? 'Niente da incassare.' : 'Nessun ordine.'}
          </Text>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="txt-compact-xsmall-plus border-t border-ui-border-base text-ui-fg-muted">
                <th className="px-6 py-2 text-left font-normal">N.</th>
                <th className="py-2 text-left font-normal">Data</th>
                <th className="py-2 pl-4 text-left font-normal">Cliente</th>
                <th className="py-2 pl-4 text-left font-normal">Prodotti</th>
                <th className="py-2 text-right font-normal">Totale</th>
                <th className="py-2 pl-4 text-right font-normal">Da incassare</th>
                <th className="py-2 pl-4 text-right font-normal">Consegna</th>
                <th className="px-6 py-2 text-right font-normal">
                  <span className="sr-only">Azioni</span>
                </th>
              </tr>
            </thead>
            <tbody className="txt-compact-small">
              {visible.map((order) => {
                const open = openId === order.id
                return (
                  <Fragment key={order.id}>
                    <tr className={clx('border-t border-ui-border-base align-middle', order.status === 'canceled' && 'text-ui-fg-muted', open && 'bg-ui-bg-subtle')}>
                      <td className="px-6 py-2">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={`${open ? 'Chiudi' : 'Apri'} il dettaglio dell'ordine ${order.code}`}
                          onClick={() => setOpenId(open ? null : order.id)}
                          className="flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                        >
                          <ChevronDownMini className={clx('transition-transform', open && 'rotate-180')} />
                          <span className="lq-figure">{order.code}</span>
                        </button>
                      </td>
                      <td className="lq-figure py-2 text-ui-fg-subtle">{formatDay(order.createdAt)}</td>
                      <td className="py-2 pl-4">
                        {order.customer}
                        {order.agent && <span className="text-ui-fg-muted"> · {order.agent}</span>}
                      </td>
                      <td className="py-2 pl-4">
                        <InlineLines
                          lines={order.lines}
                          describe={(line) => lineParts(line, formats, lines)}
                          editable={order.status !== 'canceled' && !order.delivered}
                          path={`/admin/backoffice/orders/${order.id}`}
                        />
                      </td>
                      <td className="lq-figure py-2 text-right">{formatEuro(order.total)}</td>
                      <td className="py-2 pl-4">
                        <PaymentCell order={order} />
                      </td>
                      <td className="py-2 pl-4">
                        <DeliveryCell order={order} />
                      </td>
                      <td className="px-4 py-2">
                        <RowActions order={order} open={open} onToggle={() => setOpenId(open ? null : order.id)} />
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <OrderDetail order={order} formats={formats} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </Container>
    </div>
  )
}
