import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ShoppingBag } from '@medusajs/icons'
import { Container, Heading, StatusBadge, Table, Tabs, Text } from '@medusajs/ui'
import { useState } from 'react'
import { BookingEditor } from '../../components/sales/booking-editor'
import { BookingForm } from '../../components/sales/booking-form'
import { ByCustomerTable, ByProductTable, PeriodFilter, RankingTable, SummaryFigures } from '../../components/sales/summary'
import { formatDay, formatEuro, useSalesAction, useSellBookings, useSellCatalog, useSellMe, type Period } from '../../lib/sales-api'

/**
 * Area vendita degli agenti (/app/sell): nuova prenotazione, storico con modifiche e incassi,
 * riepilogo e classifica. Si apre solo con un account collegato a un agente attivo.
 */
const SellPage = () => {
  const [period, setPeriod] = useState<Period>({})
  const [tab, setTab] = useState('nuova')
  const [selected, setSelected] = useState<string | null>(null)
  const me = useSellMe(period)
  const catalog = useSellCatalog()
  const bookings = useSellBookings(period)
  const action = useSalesAction()

  if (me.isLoading) return <Text className="text-ui-fg-subtle">Caricamento…</Text>
  if (me.isError || !me.data) {
    return (
      <Container className="px-6 py-6">
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
          setSelected((data.booking as { id: string }).id)
          setTab('storico')
        },
      },
    )

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h1">Ciao {me.data.agent.name}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Le tue prenotazioni, gli incassi e la classifica.
          </Text>
        </div>
        <PeriodFilter period={period} onChange={setPeriod} />
      </Container>

      <Container className="p-0">
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List className="px-6 pt-4">
            <Tabs.Trigger value="nuova">Nuova prenotazione</Tabs.Trigger>
            <Tabs.Trigger value="storico">Le mie prenotazioni</Tabs.Trigger>
            <Tabs.Trigger value="riepilogo">Riepilogo e classifica</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="nuova" className="px-6 py-6">
            {catalog.data ? (
              <BookingForm catalog={catalog.data} submitting={action.isPending} submitLabel="Inserisci prenotazione" onSubmit={create} />
            ) : (
              <Text className="text-ui-fg-subtle">Caricamento del catalogo…</Text>
            )}
          </Tabs.Content>

          <Tabs.Content value="storico" className="flex flex-col gap-6 px-6 py-6">
            {(bookings.data?.bookings ?? []).length === 0 && <Text className="text-ui-fg-subtle">Nessuna prenotazione nel periodo.</Text>}
            {(bookings.data?.bookings ?? []).length > 0 && (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>N.</Table.HeaderCell>
                    <Table.HeaderCell>Data</Table.HeaderCell>
                    <Table.HeaderCell>Cliente</Table.HeaderCell>
                    <Table.HeaderCell>Totale</Table.HeaderCell>
                    <Table.HeaderCell>Da incassare</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {bookings.data!.bookings.map((booking) => (
                    <Table.Row
                      key={booking.id}
                      className={`cursor-pointer ${selected === booking.id ? 'bg-ui-bg-highlight' : ''}`}
                      onClick={() => setSelected(booking.id)}
                    >
                      <Table.Cell>#{booking.displayId}</Table.Cell>
                      <Table.Cell>{formatDay(booking.createdAt)}</Table.Cell>
                      <Table.Cell>{booking.customer}</Table.Cell>
                      <Table.Cell>
                        {booking.status === 'canceled' ? <StatusBadge color="grey">Annullata</StatusBadge> : formatEuro(booking.total)}
                      </Table.Cell>
                      <Table.Cell>
                        {booking.due > 0 ? <StatusBadge color="orange">{formatEuro(booking.due)}</StatusBadge> : <StatusBadge color="green">Saldata</StatusBadge>}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
            {selected && catalog.data && <BookingEditor key={selected} bookingId={selected} catalog={catalog.data} />}
          </Tabs.Content>

          <Tabs.Content value="riepilogo" className="flex flex-col gap-6 px-6 py-6">
            <SummaryFigures summary={me.data.summary} />
            <Heading level="h2">Classifica</Heading>
            <RankingTable ranking={me.data.ranking} />
            <Heading level="h2">Per prodotto</Heading>
            <ByProductTable summary={me.data.summary} />
            <Heading level="h2">Per cliente</Heading>
            <ByCustomerTable summary={me.data.summary} />
          </Tabs.Content>
        </Tabs>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Area vendita', icon: ShoppingBag })

export default SellPage
