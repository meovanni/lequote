import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Users } from '@medusajs/icons'
import { Container, Heading, StatusBadge, Table, Text } from '@medusajs/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NewAgentDrawer } from '../../components/sales/new-agent-drawer'
import { PeriodFilter, RankingTable, SummaryFigures } from '../../components/sales/summary'
import { formatEuro, useAgentsSummary, type Period, type Summary } from '../../lib/sales-api'

/** Somma dei riepiloghi dei singoli agenti: i numeri della rete vendita nel periodo. */
function total(rows: { summary: Summary }[]): Summary {
  return rows.reduce<Summary>(
    (sum, { summary }) => ({
      ...sum,
      orders: sum.orders + summary.orders,
      revenue: sum.revenue + summary.revenue,
      paid: sum.paid + summary.paid,
      outstanding: sum.outstanding + summary.outstanding,
      quantity: sum.quantity + summary.quantity,
    }),
    { orders: 0, revenue: 0, paid: 0, outstanding: 0, quantity: 0, byProduct: [], byCustomer: [] },
  )
}

/** Agenti: i numeri della rete vendita, le vendite di ciascuno nel periodo, la classifica. */
const AgentsPage = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>({})
  const summary = useAgentsSummary(period)

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-6 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Heading level="h1">Agenti</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Apri un agente per il dettaglio per prodotto e per cliente, e per creare il suo account.
            </Text>
          </div>
          <NewAgentDrawer />
        </div>
        <PeriodFilter period={period} onChange={setPeriod} align="start" />
        {summary.data && <SummaryFigures summary={total(summary.data.agents)} />}
      </Container>

      <Container className="divide-y p-0">
        {summary.isLoading && <div className="m-6 h-40 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />}
        {summary.isError && <Text className="px-6 py-4 text-ui-fg-error">Riepilogo non disponibile.</Text>}
        {summary.data && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Agente</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Ordini</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Pezzi</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Venduto</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Da incassare</Table.HeaderCell>
                <Table.HeaderCell>Stato</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {summary.data.agents.map(({ agent, summary: row }) => (
                <Table.Row key={agent.id} className="cursor-pointer" onClick={() => navigate(`/agenti/${agent.id}`)}>
                  <Table.Cell>
                    <button type="button" className="txt-compact-small-plus text-left hover:text-ui-fg-interactive" onClick={() => navigate(`/agenti/${agent.id}`)}>
                      {agent.name}
                    </button>
                  </Table.Cell>
                  <Table.Cell className="text-right">{row.orders}</Table.Cell>
                  <Table.Cell className="text-right">{row.quantity}</Table.Cell>
                  <Table.Cell className="text-right">{formatEuro(row.revenue)}</Table.Cell>
                  <Table.Cell className={row.outstanding > 0 ? 'text-right text-ui-tag-orange-text' : 'text-right'}>{formatEuro(row.outstanding)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={agent.active ? 'green' : 'grey'}>{agent.active ? 'Attivo' : 'Non attivo'}</StatusBadge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      {summary.data && (
        <Container className="flex flex-col gap-3 px-6 py-5">
          <div>
            <Heading level="h2">Classifica</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Per venduto nel periodo, a parità per pezzi. Gli agenti nella loro area vedono solo posizione e pezzi degli altri: niente fatturato né clienti.
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
