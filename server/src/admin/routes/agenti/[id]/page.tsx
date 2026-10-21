import { Button, Container, Heading, Input, Switch, Table, Text } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FormField } from '../../../components/form-field'
import { ByCustomerTable, ByProductTable, PeriodFilter, SummaryFigures } from '../../../components/sales/summary'
import { formatDay, formatEuro, useAgentDetail, useSalesAction, type Period } from '../../../lib/sales-api'

/** Scheda agente: riepilogo per prodotto e per cliente, prenotazioni, account per l'area vendita. */
const AgentDetailPage = () => {
  const { id = '' } = useParams()
  const [period, setPeriod] = useState<Period>({})
  const detail = useAgentDetail(id, period)
  const action = useSalesAction()
  const [email, setEmail] = useState('')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  if (detail.isLoading) return <Text className="text-ui-fg-subtle">Caricamento…</Text>
  if (detail.isError || !detail.data) return <Text className="text-ui-fg-error">Agente non trovato.</Text>
  const { agent, bookings, summary } = detail.data

  const invite = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: `/admin/agents/${agent.id}/invite`, body: { email: email.trim() }, success: 'Invito creato.' },
      { onSuccess: (data) => setInviteUrl(data.invite_url as string) },
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
          <div>
            <Link to="/agenti" className="txt-compact-small text-ui-fg-subtle">
              ‹ Tutti gli agenti
            </Link>
            <Heading level="h1">{agent.name}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {[agent.email ?? 'Nessun account', agent.phone].filter(Boolean).join(' · ')}
            </Text>
          </div>
          <label className="flex items-center gap-2">
            <Switch
              checked={agent.active}
              onCheckedChange={(active) =>
                action.mutate({ path: `/admin/agents/${agent.id}`, body: { active }, success: active ? 'Agente attivato.' : 'Agente disattivato.' })
              }
            />
            <Text size="small">Attivo</Text>
          </label>
        </div>
        <div className="flex flex-col gap-3 px-6 py-4">
          <Text size="small" weight="plus">
            Account per l’area vendita
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Crea un invito con il ruolo Agente e mandagli il link: sceglie la password ed entra in /app/sell, dove vede solo le sue vendite.
          </Text>
          <form onSubmit={invite} className="flex flex-wrap items-end gap-3">
            <FormField id="agent-email" label="Email dell’agente">
              <Input id="agent-email" type="email" value={email} placeholder={agent.email ?? ''} onChange={(event) => setEmail(event.target.value)} />
            </FormField>
            <Button size="small" type="submit" isLoading={action.isPending} disabled={!email.trim()}>
              Crea invito
            </Button>
          </form>
          {inviteUrl && (
            <Text size="small" className="font-mono break-all">
              {inviteUrl}
            </Text>
          )}
        </div>
      </Container>

      <Container className="flex flex-col gap-4 px-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading level="h2">Vendite</Heading>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        <SummaryFigures summary={summary} />
        <Heading level="h3">Per prodotto</Heading>
        <ByProductTable summary={summary} />
        <Heading level="h3">Per cliente</Heading>
        <ByCustomerTable summary={summary} />
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Prenotazioni</Heading>
        </div>
        {bookings.length === 0 && <Text className="px-6 py-6 text-ui-fg-subtle">Nessuna prenotazione nel periodo.</Text>}
        {bookings.length > 0 && (
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
              {bookings.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <Link to={`/orders/${booking.id}`} className="text-ui-fg-interactive">
                      #{booking.displayId}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{formatDay(booking.createdAt)}</Table.Cell>
                  <Table.Cell>{booking.customer}</Table.Cell>
                  <Table.Cell>{booking.status === 'canceled' ? 'Annullato' : formatEuro(booking.total)}</Table.Cell>
                  <Table.Cell>{formatEuro(booking.due)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export default AgentDetailPage
