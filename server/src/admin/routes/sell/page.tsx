import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ChevronDownMini, ShoppingBag } from '@medusajs/icons'
import { Button, Container, Heading, Input, Text, clx } from '@medusajs/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PaymentCell } from '../../components/gestione/order-actions'
import { Segmented } from '../../components/inline/inline-fields'
import { BookingForm } from '../../components/sales/booking-form'
import { BookingStatus } from '../../components/sales/booking-status'
import { LinesEditor, type LineOption } from '../../components/sales/lines-editor'
import { ByCustomerTable, ByProductTable, PeriodFilter, RankingTable, SummaryFigures } from '../../components/sales/summary'
import { useUnsavedChanges } from '../../lib/unsaved-changes'
import {
  formatDay,
  formatEuro,
  PAYMENT_METHOD_LABEL,
  useSalesAction,
  useSellBooking,
  useSellBookings,
  useSellCatalog,
  useSellMe,
  type Booking,
  type Catalog,
  type Period,
} from '../../lib/sales-api'

// Area vendita degli agenti (/app/sell), nello stesso stile della pagina Gestione: i numeri del
// periodo sempre in vista, la nuova prenotazione nella pagina, l'incasso dalla riga e il dettaglio
// sotto la riga. Sul telefono le righe diventano schede una sotto l'altra.

const optionsOf = (catalog: Catalog | undefined): LineOption[] =>
  (catalog?.variants ?? []).map((variant) => ({
    variantId: variant.variantId,
    label: `${variant.product}, ${variant.variant}`,
    unit: variant.unit,
    price: variant.price,
    available: variant.available,
  }))

/** "2 × Latta 5 l a 70,00 €, 20 L da imbottigliare a 14,00 €/L". */
function describe(booking: Booking, catalog: Catalog | undefined): string {
  return booking.lines
    .map((line) => {
      const variant = catalog?.variants.find((entry) => entry.variantId === line.variantId)
      if (variant?.bulk) return `${line.quantity} ${variant.unit} ${line.subtitle.toLowerCase()} a ${formatEuro(line.unitPrice)}/${variant.unit}`
      return `${line.quantity} × ${line.subtitle || line.title} a ${formatEuro(line.unitPrice)}`
    })
    .join(', ')
}

function NewBooking({ catalog, onDone }: { catalog: Catalog | undefined; onDone: () => void }) {
  const action = useSalesAction()
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  return (
    <Container ref={ref} className="scroll-mt-4 px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Heading level="h2">Nuova prenotazione</Heading>
        <Button size="small" variant="transparent" onClick={onDone}>
          Chiudi
        </Button>
      </div>
      {catalog ? (
        <BookingForm
          catalog={catalog}
          submitting={action.isPending}
          submitLabel="Inserisci prenotazione"
          onDirtyChange={setDirty}
          onSubmit={(body) =>
            action.mutate(
              { path: '/admin/sell/bookings', body, success: 'Prenotazione inserita.' },
              {
                onSuccess: () => {
                  setDirty(false)
                  onDone()
                },
              },
            )
          }
        />
      ) : (
        <div className="h-64 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento del catalogo" />
      )}
    </Container>
  )
}

function BookingDetail({ booking, catalog }: { booking: Booking; catalog: Catalog | undefined }) {
  const detail = useSellBooking(booking.id)
  const action = useSalesAction()
  const open = booking.status !== 'canceled' && booking.status !== 'completed' && !booking.delivered
  const payments = detail.data?.payments.payments ?? []

  return (
    <div className="grid grid-cols-1 gap-5 bg-ui-bg-subtle px-4 py-4 sm:px-6 lg:grid-cols-3">
      <div className="flex flex-col gap-1">
        <Text size="small" className="text-ui-fg-subtle">{booking.delivery}</Text>
        {booking.phone && (
          <a href={`tel:${booking.phone}`} className="txt-compact-small text-ui-fg-interactive">
            Chiama {booking.phone}
          </a>
        )}
        {booking.email && <Text size="small" className="text-ui-fg-subtle">{booking.email}</Text>}
        <label className="mt-2 flex flex-col gap-1">
          <span className="txt-compact-xsmall text-ui-fg-subtle">Note</span>
          <textarea
            defaultValue={booking.notes ?? ''}
            disabled={!open}
            rows={2}
            onBlur={(event) => {
              const notes = event.target.value.trim()
              if (notes !== (booking.notes ?? '')) action.mutate({ path: `/admin/sell/bookings/${booking.id}`, body: { notes: notes || null }, success: 'Note salvate.' })
            }}
            className="txt-compact-small rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 outline-none focus:border-ui-border-interactive"
          />
        </label>
      </div>
      <LinesEditor key={JSON.stringify(booking.lines)} lines={booking.lines} options={optionsOf(catalog)} editable={open} path={`/admin/sell/bookings/${booking.id}`} />
      <div className="flex flex-col gap-2">
        <Text size="small" weight="plus">Incassi</Text>
        {payments.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">Nessun incasso registrato.</Text>
        ) : (
          <ul className="flex flex-col gap-1">
            {payments.map((payment) => (
              <li key={payment.id} className="flex justify-between gap-3">
                <Text size="small" className="text-ui-fg-subtle">
                  {formatDay(payment.paid_at)}, {PAYMENT_METHOD_LABEL[payment.method].toLowerCase()}
                </Text>
                <Text size="small" className="lq-figure">{formatEuro(Number(payment.amount))}</Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

type Filter = 'incassare' | 'tutte'

function Bookings({ bookings, catalog }: { bookings: Booking[]; catalog: Catalog | undefined }) {
  const [filter, setFilter] = useState<Filter>('tutte')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const toCollect = (booking: Booking) => booking.status !== 'canceled' && booking.due > 0
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bookings.filter((booking) => (filter === 'incassare' ? toCollect(booking) : true)).filter((booking) => !term || booking.customer.toLowerCase().includes(term))
  }, [bookings, filter, search])

  return (
    <Container className="p-0">
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
        <Heading level="h2" className="mr-2">Le mie prenotazioni</Heading>
        <Segmented
          label="Quali prenotazioni"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'tutte', label: 'Tutte', count: bookings.length },
            { value: 'incassare', label: 'Da incassare', count: bookings.filter(toCollect).length },
          ]}
        />
        <Input size="small" type="search" placeholder="Cerca cliente" aria-label="Cerca cliente" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:w-56" />
      </div>
      {visible.length === 0 ? (
        <Text size="small" className="border-t border-ui-border-base px-6 py-8 text-center text-ui-fg-subtle">
          {filter === 'incassare' ? 'Niente da incassare.' : 'Nessuna prenotazione nel periodo.'}
        </Text>
      ) : (
        <ul>
          {visible.map((booking) => {
            const open = openId === booking.id
            return (
              <li key={booking.id} className={clx('border-t border-ui-border-base', open && 'bg-ui-bg-subtle', booking.status === 'canceled' && 'text-ui-fg-muted')}>
                <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 px-4 py-3 sm:px-6 md:grid-cols-[auto_6rem_minmax(0,1fr)_minmax(0,1.6fr)_6rem_auto]">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-label={`${open ? 'Chiudi' : 'Apri'} la prenotazione ${booking.displayId}`}
                    onClick={() => setOpenId(open ? null : booking.id)}
                    className="flex items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    <ChevronDownMini className={clx('transition-transform', open && 'rotate-180')} />
                    <span className="lq-figure txt-compact-small">{booking.displayId}</span>
                  </button>
                  <Text size="small" className="lq-figure text-ui-fg-subtle md:order-none">{formatDay(booking.createdAt)}</Text>
                  <Text size="small" weight="plus" className="col-span-2 md:col-span-1">{booking.customer}</Text>
                  <Text size="small" className="col-span-2 text-ui-fg-subtle md:col-span-1">{describe(booking, catalog)}</Text>
                  <Text size="small" className="lq-figure md:text-right">{booking.status === 'canceled' ? '-' : formatEuro(booking.total)}</Text>
                  <div className="flex justify-end">
                    {booking.status === 'canceled' || booking.due <= 0 ? (
                      <BookingStatus booking={booking} />
                    ) : (
                      <PaymentCell order={booking} path={`/admin/sell/bookings/${booking.id}/payments`} />
                    )}
                  </div>
                </div>
                {open && <BookingDetail booking={booking} catalog={catalog} />}
              </li>
            )
          })}
        </ul>
      )}
    </Container>
  )
}

const SellPage = () => {
  const [period, setPeriod] = useState<Period>({})
  const [creating, setCreating] = useState(false)
  const me = useSellMe(period)
  const catalog = useSellCatalog()
  const bookings = useSellBookings(period)

  if (me.isLoading) return <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  if (me.isError || !me.data) {
    return (
      <Container className="flex flex-col gap-2 px-6 py-8">
        <Heading level="h1">Area vendita</Heading>
        <Text className="text-ui-fg-subtle">
          Questo account non è collegato a un agente attivo. L’area vendita si apre con l’invito mandato dalla pagina Agenti.
        </Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-5 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level="h1">Ciao {me.data.agent.name}</Heading>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter period={period} onChange={setPeriod} />
            <Button size="small" onClick={() => setCreating(true)} disabled={creating}>
              Nuova prenotazione
            </Button>
          </div>
        </div>
        <SummaryFigures summary={me.data.summary} />
      </Container>

      {creating && <NewBooking catalog={catalog.data} onDone={() => setCreating(false)} />}
      {catalog.isError && <Text className="px-1 text-ui-fg-error">Catalogo non disponibile: riprova tra poco.</Text>}

      {bookings.isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
      ) : (
        <Bookings bookings={bookings.data?.bookings ?? []} catalog={catalog.data} />
      )}

      <Container className="flex flex-col gap-6 px-4 py-5 sm:px-6">
        <section className="flex flex-col gap-3">
          <Heading level="h2">Classifica</Heading>
          <RankingTable ranking={me.data.ranking} />
        </section>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <section className="flex flex-col gap-3">
            <Heading level="h3">Per prodotto</Heading>
            <ByProductTable summary={me.data.summary} />
          </section>
          <section className="flex flex-col gap-3">
            <Heading level="h3">Per cliente</Heading>
            <ByCustomerTable summary={me.data.summary} />
          </section>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Area vendita', icon: ShoppingBag, rank: 4 })

export default SellPage
