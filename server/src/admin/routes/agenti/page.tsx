import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ChevronDownMini, Users } from '@medusajs/icons'
import { Button, Container, Heading, Input, Switch, Text, clx } from '@medusajs/ui'
import { Fragment, useState, type FormEvent } from 'react'
import { InlineText } from '../../components/inline/inline-fields'
import { AgentDetail } from '../../components/sales/agent-detail'
import { PeriodFilter, RankingTable, SummaryFigures } from '../../components/sales/summary'
import { formatEuro, useAgents, useAgentsSummary, useSalesAction, type Period, type Summary } from '../../lib/sales-api'

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

function NewAgentRow() {
  const action = useSalesAction()
  const [name, setName] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate({ path: '/admin/agents', body: { name: name.trim() }, success: 'Agente aggiunto: completa telefono ed email nella riga.' }, { onSuccess: () => setName('') })
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 border-t border-ui-border-base bg-ui-bg-subtle px-6 py-3">
      <Text size="small" weight="plus" className="mr-2">Nuovo agente</Text>
      <Input size="small" aria-label="Nome dell’agente" placeholder="Nome e cognome" value={name} onChange={(event) => setName(event.target.value)} className="w-60" />
      <Button size="small" type="submit" disabled={!name.trim()} isLoading={action.isPending}>
        Aggiungi
      </Button>
    </form>
  )
}

// Agenti in una pagina: numeri della rete nel periodo, una riga per agente con contatti e stato
// modificabili sul posto, il dettaglio aperto sotto la riga, la classifica in fondo.
const AgentsPage = () => {
  const [period, setPeriod] = useState<Period>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const summary = useAgentsSummary(period)
  const agents = useAgents()
  const action = useSalesAction()
  const save = (id: string, body: Record<string, unknown>, success = 'Salvato.') => action.mutate({ path: `/admin/agents/${id}`, body, success })
  const rows = summary.data?.agents ?? []

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-5 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level="h1">Agenti</Heading>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        {summary.data && <SummaryFigures summary={total(rows)} />}
      </Container>

      <Container className="p-0">
        {summary.isLoading && <div className="m-6 h-40 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />}
        {summary.isError && <Text className="px-6 py-4 text-ui-fg-error">Riepilogo non disponibile.</Text>}
        {rows.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="txt-compact-xsmall-plus text-ui-fg-muted">
                <th className="px-6 py-3 text-left font-normal">Agente</th>
                <th className="px-2 py-3 text-left font-normal">Telefono</th>
                <th className="px-2 py-3 text-left font-normal">Email</th>
                <th className="py-3 text-right font-normal">Ordini</th>
                <th className="py-3 text-right font-normal">Pezzi</th>
                <th className="py-3 text-right font-normal">Venduto</th>
                <th className="py-3 pl-4 text-right font-normal">Da incassare</th>
                <th className="px-6 py-3 text-right font-normal">Attivo</th>
              </tr>
            </thead>
            <tbody className="txt-compact-small">
              {rows.map(({ agent: base, summary: row }) => {
                const agent = agents.data?.agents.find((entry) => entry.id === base.id) ?? { ...base, email: null, phone: null, notes: null }
                const open = openId === agent.id
                return (
                  <Fragment key={agent.id}>
                    <tr className={clx('border-t border-ui-border-base', open && 'bg-ui-bg-subtle', !agent.active && 'text-ui-fg-muted')}>
                      <td className="py-1 pl-4 pr-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-label={`${open ? 'Chiudi' : 'Apri'} il dettaglio di ${agent.name}`}
                            onClick={() => setOpenId(open ? null : agent.id)}
                            className="rounded p-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                          >
                            <ChevronDownMini className={clx('transition-transform', open && 'rotate-180')} />
                          </button>
                          <InlineText value={agent.name} label="Nome dell’agente" required className="min-w-[11rem]" onSave={(name) => save(agent.id, { name })} />
                        </div>
                      </td>
                      <td className="px-1 py-1">
                        <InlineText type="tel" value={agent.phone} label={`Telefono di ${agent.name}`} onSave={(phone) => save(agent.id, { phone })} />
                      </td>
                      <td className="px-1 py-1">
                        <InlineText type="email" value={agent.email} label={`Email di ${agent.name}`} onSave={(email) => save(agent.id, { email })} />
                      </td>
                      <td className="lq-figure py-1 text-right">{row.orders}</td>
                      <td className="lq-figure py-1 text-right">{row.quantity}</td>
                      <td className="lq-figure py-1 text-right">{formatEuro(row.revenue)}</td>
                      <td className={clx('lq-figure py-1 pl-4 text-right', row.outstanding > 0 && 'text-ui-tag-orange-text')}>{formatEuro(row.outstanding)}</td>
                      <td className="px-6 py-1 text-right">
                        <Switch
                          aria-label={`${agent.name} attivo`}
                          checked={agent.active}
                          onCheckedChange={(active) => save(agent.id, { active }, active ? 'Agente attivato.' : 'Agente disattivato.')}
                        />
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <AgentDetail agent={agent} period={period} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
        <NewAgentRow />
      </Container>

      {summary.data && summary.data.ranking.length > 0 && (
        <Container className="flex flex-col gap-3 px-6 py-5">
          <div>
            <Heading level="h2">Classifica</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Per venduto nel periodo. Nella loro area gli agenti vedono solo posizione e pezzi degli altri.
            </Text>
          </div>
          <RankingTable ranking={summary.data.ranking} />
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Agenti', icon: Users, rank: 3 })

export default AgentsPage
