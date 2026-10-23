import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ShoppingBag } from '@medusajs/icons'
import { Button, Container, Drawer, Heading, Table, Tabs, Text } from '@medusajs/ui'
import { useState, type ReactNode } from 'react'
import { BookingEditor } from '../../components/sales/booking-editor'
import { BookingForm } from '../../components/sales/booking-form'
import { BookingStatus } from '../../components/sales/booking-status'
import { useGuardedOpen } from '../../components/use-guarded-open'
import { ByCustomerTable, ByProductTable, PeriodFilter, RankingTable, SummaryFigures } from '../../components/sales/summary'
import { formatDay, formatEuro, useSalesAction, useSellBookings, useSellCatalog, useSellMe, type Booking, type Catalog, type Period } from '../../lib/sales-api'

/**
 * Area vendita degli agenti (/app/sell): nuova prenotazione, storico con modifiche e incassi,
 * riepilogo e classifica. Si apre solo con un account collegato a un agente attivo.
 */
const SellPage = () => {
  const [period, setPeriod] = useState<Period>({})
  const [tab, setTab] = useState('nuova')
  const [selected, setSelected] = useState<Booking | null>(null)
  const [editorDirty, setEditorDirty] = useState(false)
  // Cresce a ogni prenotazione inserita: il modulo riparte vuoto.
  const [formKey, setFormKey] = useState(0)
  const me = useSellMe(period)
  const catalog = useSellCatalog()
  const bookings = useSellBookings(period)
  const action = useSalesAction()
  const drawer = useGuardedOpen({
    dirty: editorDirty,
    onDiscard: () => {
      setEditorDirty(false)
      setSelected(null)
    },
  })
  const openBooking = (booking: Booking) => {
    setSelected(booking)
    drawer.onOpenChange(true)
  }

  if (me.isLoading) return <PageSkeleton />
  if (me.isError || !me.data) {
    return (
      <Container className="flex flex-col gap-2 px-6 py-8">
        <Heading level="h1">Area vendita</Heading>
        <Text className="text-ui-fg-subtle">
          Questo account non è collegato a un agente attivo. L’area vendita si apre con l’account creato dalla scheda dell’agente.
        </Text>
      </Container>
    )
  }

  const create = (body: Record<string, unknown>) =>
    action.mutate(
      { path: '/admin/sell/bookings', body, success: 'Prenotazione inserita.' },
      {
        onSuccess: (data) => {
          setFormKey((key) => key + 1)
          openBooking(data.booking as Booking)
          setTab('storico')
        },
      },
    )

  const toolbar = (title: string) => (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Heading level="h2">{title}</Heading>
      <PeriodFilter period={period} onChange={setPeriod} />
    </div>
  )

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="px-6 py-5">
        <Heading level="h1">Ciao {me.data.agent.name}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Le tue prenotazioni, gli incassi e la classifica.
        </Text>
      </Container>

      <Container className="p-0">
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List className="border-b border-ui-border-base px-6 py-3">
            <Tabs.Trigger value="nuova">
              <TabLabel full="Nuova prenotazione" short="Nuova" />
            </Tabs.Trigger>
            <Tabs.Trigger value="storico">
              <TabLabel full="Le mie prenotazioni" short="Storico" />
            </Tabs.Trigger>
            <Tabs.Trigger value="riepilogo">
              <TabLabel full="Riepilogo e classifica" short="Riepilogo" />
            </Tabs.Trigger>
          </Tabs.List>

          {/* Sempre montata: passando allo storico e tornando, quello che si stava scrivendo resta. */}
          <Tabs.Content value="nuova" forceMount className="data-[state=inactive]:hidden px-6 py-6">
            <NewBooking key={formKey} catalog={catalog.data} failed={catalog.isError} submitting={action.isPending} onSubmit={create} />
          </Tabs.Content>

          <Tabs.Content value="storico" className="data-[state=inactive]:hidden flex flex-col gap-5 px-6 py-6">
            {toolbar('Le mie prenotazioni')}
            <BookingList bookings={bookings.data?.bookings} loading={bookings.isLoading} onOpen={openBooking} onNew={() => setTab('nuova')} />
          </Tabs.Content>

          <Tabs.Content value="riepilogo" className="data-[state=inactive]:hidden flex flex-col gap-8 px-6 py-6">
            {toolbar('Il tuo periodo')}
            <SummaryFigures summary={me.data.summary} />
            <Section title="Classifica">
              <RankingTable ranking={me.data.ranking} />
            </Section>
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <Section title="Per prodotto">
                <ByProductTable summary={me.data.summary} />
              </Section>
              <Section title="Per cliente">
                <ByCustomerTable summary={me.data.summary} />
              </Section>
            </div>
          </Tabs.Content>
        </Tabs>
      </Container>

      <Drawer open={drawer.open} onOpenChange={drawer.onOpenChange}>
        <Drawer.Content {...drawer.contentProps}>
          <Drawer.Header>
            <Drawer.Title>{selected ? `Prenotazione n. ${selected.displayId}` : 'Prenotazione'}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            {selected && catalog.data && <BookingEditor key={selected.id} bookingId={selected.id} catalog={catalog.data} onDirtyChange={setEditorDirty} />}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

/** Etichetta della scheda: per intero da tablet in su, corta sul telefono, sempre su una riga. */
function TabLabel({ full, short }: { full: string; short: string }) {
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level="h3">{title}</Heading>
      {children}
    </section>
  )
}

type NewBookingProps = { catalog?: Catalog; failed: boolean; submitting: boolean; onSubmit: (body: Record<string, unknown>) => void }

function NewBooking({ catalog, failed, submitting, onSubmit }: NewBookingProps) {
  if (failed) return <Text className="text-ui-fg-error">Catalogo non disponibile: riprova tra poco.</Text>
  if (!catalog) return <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento del catalogo" />
  return <BookingForm catalog={catalog} submitting={submitting} submitLabel="Inserisci prenotazione" onSubmit={onSubmit} />
}

type BookingListProps = { bookings?: Booking[]; loading: boolean; onOpen: (booking: Booking) => void; onNew: () => void }

/** Storico: una riga per prenotazione, il clic apre il pannello con righe, note e incassi. */
function BookingList({ bookings, loading, onOpen, onNew }: BookingListProps) {
  if (loading) return <div className="h-48 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-ui-border-strong px-6 py-10 text-center">
        <Text size="small" className="text-ui-fg-subtle">
          Nessuna prenotazione nel periodo.
        </Text>
        <Button size="small" variant="secondary" onClick={onNew}>
          Nuova prenotazione
        </Button>
      </div>
    )
  }
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>N.</Table.HeaderCell>
          <Table.HeaderCell>Data</Table.HeaderCell>
          <Table.HeaderCell>Cliente</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Totale</Table.HeaderCell>
          <Table.HeaderCell>Incasso</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {bookings.map((booking) => (
          <Table.Row key={booking.id} className="cursor-pointer" onClick={() => onOpen(booking)}>
            <Table.Cell className="text-ui-fg-subtle">#{booking.displayId}</Table.Cell>
            <Table.Cell>{formatDay(booking.createdAt)}</Table.Cell>
            <Table.Cell>
              <button type="button" className="text-left hover:text-ui-fg-interactive" onClick={() => onOpen(booking)}>
                {booking.customer}
              </button>
            </Table.Cell>
            <Table.Cell className="text-right">{booking.status === 'canceled' ? '-' : formatEuro(booking.total)}</Table.Cell>
            <Table.Cell>
              <BookingStatus booking={booking} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-y-3" aria-label="Caricamento">
      <div className="h-20 animate-pulse rounded-lg bg-ui-bg-component" />
      <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" />
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Area vendita', icon: ShoppingBag })

export default SellPage
