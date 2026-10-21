import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Users } from '@medusajs/icons'
import { Button, Container, Heading, Input, StatusBadge, Table, Text } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField, orNull } from '../../components/form-field'
import { PeriodFilter, RankingTable } from '../../components/sales/summary'
import { formatEuro, useAgentsSummary, useSalesAction, type Period } from '../../lib/sales-api'

/** Agenti: vendite di ciascuno nel periodo, classifica, nuovo agente. */
const AgentsPage = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>({})
  const summary = useAgentsSummary(period)
  const action = useSalesAction()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const create = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: '/admin/agents', body: { name: name.trim(), phone: orNull(phone) }, success: 'Agente aggiunto.' },
      {
        onSuccess: () => {
          setName('')
          setPhone('')
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h1">Agenti</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Vendite di ogni agente: apri la scheda per il dettaglio per prodotto e per cliente, e per creare il suo account.
            </Text>
          </div>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        {summary.isError && <Text className="px-6 py-4 text-ui-fg-error">Riepilogo non disponibile.</Text>}
        {summary.data && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Agente</Table.HeaderCell>
                <Table.HeaderCell>Ordini</Table.HeaderCell>
                <Table.HeaderCell>Pezzi</Table.HeaderCell>
                <Table.HeaderCell>Venduto</Table.HeaderCell>
                <Table.HeaderCell>Da incassare</Table.HeaderCell>
                <Table.HeaderCell>Stato</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {summary.data.agents.map(({ agent, summary: row }) => (
                <Table.Row key={agent.id} className="cursor-pointer" onClick={() => navigate(`/agenti/${agent.id}`)}>
                  <Table.Cell>{agent.name}</Table.Cell>
                  <Table.Cell>{row.orders}</Table.Cell>
                  <Table.Cell>{row.quantity}</Table.Cell>
                  <Table.Cell>{formatEuro(row.revenue)}</Table.Cell>
                  <Table.Cell>{formatEuro(row.outstanding)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={agent.active ? 'green' : 'grey'}>{agent.active ? 'Attivo' : 'Non attivo'}</StatusBadge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        <form onSubmit={create} className="flex flex-wrap items-end gap-3 px-6 py-4">
          <FormField id="agent-name" label="Nuovo agente">
            <Input id="agent-name" value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField id="agent-phone" label="Telefono">
            <Input id="agent-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </FormField>
          <Button size="small" type="submit" isLoading={action.isPending} disabled={!name.trim()}>
            Aggiungi
          </Button>
        </form>
      </Container>

      {summary.data && (
        <Container className="divide-y p-0">
          <div className="px-6 py-4">
            <Heading level="h2">Classifica</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Per venduto nel periodo, a parità per pezzi. Gli agenti la vedono nella loro area, senza i clienti degli altri.
            </Text>
          </div>
          <RankingTable ranking={summary.data.ranking} />
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Agenti', icon: Users })

export default AgentsPage
