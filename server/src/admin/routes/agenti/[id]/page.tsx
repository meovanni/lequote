import { ArrowLeftMini } from '@medusajs/icons'
import { Button, Container, Copy, Heading, Input, Switch, Table, Text } from '@medusajs/ui'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FormField } from '../../../components/form-field'
import { BookingStatus } from '../../../components/sales/booking-status'
import { ByCustomerTable, ByProductTable, PeriodFilter, SummaryFigures } from '../../../components/sales/summary'
import { formatDay, formatEuro, useAgentDetail, useSalesAction, type Agent, type Booking, type Period } from '../../../lib/sales-api'

/** Scheda agente: riepilogo per prodotto e per cliente, prenotazioni, account per l'area vendita. */
const AgentDetailPage = () => {
  const { id = '' } = useParams()
  const [period, setPeriod] = useState<Period>({})
  const detail = useAgentDetail(id, period)
  const action = useSalesAction()

  if (detail.isLoading) {
    return (
      <div className="flex flex-col gap-y-3" aria-label="Caricamento">
        <div className="h-28 animate-pulse rounded-lg bg-ui-bg-component" />
        <div className="h-72 animate-pulse rounded-lg bg-ui-bg-component" />
      </div>
    )
  }
  if (detail.isError || !detail.data) return <Text className="text-ui-fg-error">Agente non trovato.</Text>
  const { agent, bookings, summary } = detail.data

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-4 px-6 py-5">
        <Link to="/agenti" className="flex w-fit items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base">
          <ArrowLeftMini />
          <span className="txt-compact-small">Tutti gli agenti</span>
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Heading level="h1">{agent.name}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {agent.email ?? 'Nessun account per l’area vendita'}
            </Text>
            {agent.phone && (
              <Text size="small" className="text-ui-fg-subtle">
                Telefono <a href={`tel:${agent.phone}`} className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">{agent.phone}</a>
              </Text>
            )}
          </div>
          <label className="flex items-center gap-2">
            <Switch
              checked={agent.active}
              onCheckedChange={(active) =>
                action.mutate({ path: `/admin/agents/${agent.id}`, body: { active }, success: active ? 'Agente attivato.' : 'Agente disattivato.' })
              }
            />
            <Text size="small">{agent.active ? 'Attivo' : 'Non attivo'}</Text>
          </label>
        </div>
      </Container>

      <Container className="flex flex-col gap-6 px-6 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Heading level="h2">Vendite</Heading>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        <SummaryFigures summary={summary} />
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <Section title="Per prodotto">
            <ByProductTable summary={summary} />
          </Section>
          <Section title="Per cliente">
            <ByCustomerTable summary={summary} />
          </Section>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Prenotazioni</Heading>
        </div>
        <Bookings bookings={bookings} />
      </Container>

      <AccountPanel agent={agent} />
    </div>
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

function Bookings({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <Text size="small" className="px-6 py-8 text-center text-ui-fg-subtle">
        Nessuna prenotazione nel periodo.
      </Text>
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
          <Table.Row key={booking.id}>
            <Table.Cell>
              <Link to={`/orders/${booking.id}`} className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                #{booking.displayId}
              </Link>
            </Table.Cell>
            <Table.Cell>{formatDay(booking.createdAt)}</Table.Cell>
            <Table.Cell>{booking.customer}</Table.Cell>
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

/** Invito con il ruolo Agente: il link si copia e si manda all'agente. */
function AccountPanel({ agent }: { agent: Agent }) {
  const action = useSalesAction()
  const [email, setEmail] = useState(agent.email ?? '')
  const [invite, setInvite] = useState<{ url: string; to: string; sent: boolean } | null>(null)

  const send = (event: FormEvent) => {
    event.preventDefault()
    const to = email.trim()
    action.mutate(
      { path: `/admin/agents/${agent.id}/invite`, body: { email: to }, success: 'Invito creato.' },
      { onSuccess: (data) => setInvite({ url: data.invite_url as string, to, sent: data.email_sent === true }) },
    )
  }

  return (
    <Container className="flex flex-col gap-4 px-6 py-5">
      <div>
        <Heading level="h2">Account per l’area vendita</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          L’invito con il ruolo Agente parte per email: l’agente sceglie la password ed entra nella sua area, dove vede solo le sue vendite.
        </Text>
      </div>
      <form onSubmit={send} className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-sm">
          <FormField id="agent-email" label="Email dell’agente">
            <Input id="agent-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FormField>
        </div>
        <Button size="small" type="submit" isLoading={action.isPending} disabled={!email.trim()}>
          Manda l’invito
        </Button>
      </form>
      {invite && (
        <div className="flex flex-col gap-2 rounded-lg border border-ui-border-base bg-ui-bg-component px-4 py-3">
          <Text size="small" className={invite.sent ? 'text-ui-fg-base' : 'text-ui-fg-error'}>
            {invite.sent
              ? `Invito mandato a ${invite.to}. Se non lo trova (anche nella posta indesiderata), mandagli questo link:`
              : `L’email a ${invite.to} non è partita: mandagli tu questo link.`}
          </Text>
          <div className="flex items-center gap-3">
            <Text size="xsmall" className="min-w-0 flex-1 break-all font-mono text-ui-fg-subtle">
              {invite.url}
            </Text>
            <Copy content={invite.url} />
          </div>
        </div>
      )}
    </Container>
  )
}

export default AgentDetailPage
