import { Button, Copy, Text } from '@medusajs/ui'
import { useState } from 'react'
import { formatDay, formatEuro, useAgentDetail, useSalesAction, type Agent, type Period } from '../../lib/sales-api'
import { InlineText, Labeled } from '../inline/inline-fields'
import { BookingStatus } from './booking-status'
import { ByCustomerTable, ByProductTable } from './summary'

// L'agente aperto sotto la sua riga: vendite per prodotto e per cliente, prenotazioni, note e
// invito per l'area vendita. Niente scheda a parte.

function Invite({ agent }: { agent: Agent }) {
  const action = useSalesAction()
  const [invite, setInvite] = useState<{ url: string; sent: boolean } | null>(null)
  if (!agent.email) {
    return <Text size="small" className="text-ui-fg-subtle">Scrivi l’email dell’agente nella riga per mandargli l’invito all’area vendita.</Text>
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="small"
          variant="secondary"
          isLoading={action.isPending}
          onClick={() =>
            action.mutate(
              { path: `/admin/agents/${agent.id}/invite`, body: { email: agent.email }, success: 'Invito creato.' },
              { onSuccess: (data) => setInvite({ url: data.invite_url as string, sent: data.email_sent === true }) },
            )
          }
        >
          Manda l’invito a {agent.email}
        </Button>
        <Text size="xsmall" className="text-ui-fg-muted">L’agente sceglie la password ed entra nella sua area, dove vede solo le sue vendite.</Text>
      </div>
      {invite && (
        <div className="flex flex-col gap-1 rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-2">
          <Text size="small" className={invite.sent ? undefined : 'text-ui-fg-error'}>
            {invite.sent ? 'Invito mandato. Se non lo trova, mandagli questo link:' : 'L’email non è partita: mandagli tu questo link.'}
          </Text>
          <div className="flex items-center gap-2">
            <Text size="xsmall" className="min-w-0 flex-1 break-all font-mono text-ui-fg-subtle">{invite.url}</Text>
            <Copy content={invite.url} />
          </div>
        </div>
      )}
    </div>
  )
}

export function AgentDetail({ agent, period }: { agent: Agent; period: Period }) {
  const detail = useAgentDetail(agent.id, period)
  const action = useSalesAction()
  if (!detail.data) return <div className="m-4 h-32 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  const { bookings, summary } = detail.data

  return (
    <div className="grid grid-cols-1 gap-6 bg-ui-bg-subtle px-6 py-4 xl:grid-cols-3">
      <section className="flex flex-col gap-2">
        <Text size="small" weight="plus">Per prodotto</Text>
        <ByProductTable summary={summary} />
        <Text size="small" weight="plus" className="pt-2">Per cliente</Text>
        <ByCustomerTable summary={summary} />
      </section>
      <section className="flex flex-col gap-2">
        <Text size="small" weight="plus">Prenotazioni del periodo</Text>
        {bookings.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">Nessuna.</Text>
        ) : (
          <ul className="flex flex-col gap-1">
            {bookings.map((booking) => (
              <li key={booking.id} className="flex items-center justify-between gap-3">
                <Text size="small" className="min-w-0 truncate">
                  <span className="lq-figure text-ui-fg-muted">{booking.code}</span> · {formatDay(booking.createdAt)} · {booking.customer}
                </Text>
                <span className="flex shrink-0 items-center gap-2">
                  <Text size="small" className="lq-figure">{booking.status === 'canceled' ? '-' : formatEuro(booking.total)}</Text>
                  <BookingStatus booking={booking} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <Text size="xsmall" className="text-ui-fg-muted">Incassi e consegne si registrano nella pagina Gestione.</Text>
      </section>
      <section className="flex flex-col gap-3">
        <Labeled label="Note">
          <InlineText multiline value={agent.notes} label={`Note su ${agent.name}`} onSave={(notes) => action.mutate({ path: `/admin/agents/${agent.id}`, body: { notes }, success: 'Salvato.' })} />
        </Labeled>
        <Invite agent={agent} />
      </section>
    </div>
  )
}
