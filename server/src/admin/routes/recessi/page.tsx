import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ArrowUturnLeft } from '@medusajs/icons'
import { Container, Heading, StatusBadge, Switch, Table, Text, toast } from '@medusajs/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InlineText } from '../../components/inline/inline-fields'
import { refundDeadline } from '../../lib/refund-deadline'
import { sdk } from '../../lib/sdk'

type Withdrawal = {
  id: string
  name: string
  email: string
  order_reference: string
  order_id: string | null
  details: string | null
  locale: string
  submitted_at: string
  handled_at: string | null
  /** Note interne: rimborso fatto, merce rientrata, accordi col cliente. */
  notes: string | null
}

const KEY = ['recessi']

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Rome' })
}

/** Scadenza del rimborso: per i recessi aperti, i giorni che restano (in ottone gli ultimi tre, in rosso se scaduta). */
function RefundDue({ withdrawal }: { withdrawal: Withdrawal }) {
  const { due, daysLeft, level } = refundDeadline(withdrawal.submitted_at)
  const day = due.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' })
  if (withdrawal.handled_at) return <span className="text-ui-fg-muted">{day}</span>
  const left = daysLeft < 0 ? `scaduto da ${-daysLeft} ${daysLeft === -1 ? 'giorno' : 'giorni'}` : daysLeft === 0 ? 'scade oggi' : `${daysLeft} ${daysLeft === 1 ? 'giorno' : 'giorni'}`
  return (
    <span className="flex flex-col">
      <span>{day}</span>
      <span className={level === 'late' ? 'text-ui-fg-error' : level === 'soon' ? 'text-ui-tag-orange-text' : 'text-ui-fg-subtle'}>{left}</span>
    </span>
  )
}

/** Recessi inviati dal sito (art. 54-bis Cod. Consumo): rimborso entro 14 giorni dalla ricezione. */
const WithdrawalsPage = () => {
  const [onlyOpen, setOnlyOpen] = useState(true)
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: [...KEY, onlyOpen],
    queryFn: () =>
      sdk.client.fetch<{ withdrawals: Withdrawal[]; count: number }>('/admin/withdrawals', {
        query: onlyOpen ? { open: '1' } : {},
      }),
  })
  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; handled?: boolean; notes?: string | null }) =>
      sdk.client.fetch(`/admin/withdrawals/${id}`, { method: 'POST', body }),
    onSuccess: (_data, { handled }) => {
      queryClient.invalidateQueries({ queryKey: KEY })
      toast.success(handled === undefined ? 'Note salvate.' : handled ? 'Recesso segnato come gestito.' : 'Recesso riaperto.')
    },
    onError: (error: Error) => toast.error(error.message || 'Operazione non riuscita.'),
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h1">Recessi</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Dichiarazioni inviate dal sito. Il cliente ha già ricevuto la ricevuta automatica; il rimborso va fatto entro 14
            giorni dalla data di invio.
          </Text>
        </div>
        <label className="flex items-center gap-2">
          <Switch checked={onlyOpen} onCheckedChange={setOnlyOpen} />
          <Text size="small">Solo da gestire</Text>
        </label>
      </div>

      {isError && <Text className="px-6 py-4 text-ui-fg-error">Non è stato possibile caricare i recessi.</Text>}
      {isLoading && <div className="m-6 h-24 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />}
      {data && data.withdrawals.length === 0 && (
        <Text size="small" className="px-6 py-10 text-center text-ui-fg-subtle">
          {onlyOpen ? 'Nessun recesso da gestire.' : 'Nessun recesso ricevuto.'}
        </Text>
      )}
      {data && data.withdrawals.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Inviato</Table.HeaderCell>
              <Table.HeaderCell>Cliente</Table.HeaderCell>
              <Table.HeaderCell>Ordine</Table.HeaderCell>
              <Table.HeaderCell>Prodotti o note</Table.HeaderCell>
              <Table.HeaderCell>Rimborso entro</Table.HeaderCell>
              <Table.HeaderCell>Note interne</Table.HeaderCell>
              <Table.HeaderCell>Gestito</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.withdrawals.map((withdrawal) => (
              <Table.Row key={withdrawal.id}>
                <Table.Cell>{formatTimestamp(withdrawal.submitted_at)}</Table.Cell>
                <Table.Cell>
                  <span className="flex flex-col">
                    <span>{withdrawal.name}</span>
                    <span className="text-ui-fg-subtle">{withdrawal.email}</span>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {withdrawal.order_id ? (
                    <Link to={`/orders/${withdrawal.order_id}`} className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                      {withdrawal.order_reference}
                    </Link>
                  ) : (
                    <span title="Numero o email non corrispondono a un ordine: verificare a mano">
                      {withdrawal.order_reference} <StatusBadge color="orange">da verificare</StatusBadge>
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-xs whitespace-normal">{withdrawal.details ?? ''}</Table.Cell>
                <Table.Cell>
                  <RefundDue withdrawal={withdrawal} />
                </Table.Cell>
                <Table.Cell className="min-w-[14rem]">
                  <InlineText
                    multiline
                    value={withdrawal.notes}
                    label={`Note interne sul recesso di ${withdrawal.name}`}
                    placeholder="es. rimborsato con bonifico il…"
                    onSave={(notes) => update.mutate({ id: withdrawal.id, notes })}
                  />
                </Table.Cell>
                <Table.Cell>
                  {/* Un clic: gestito o da gestire, senza pulsanti a parte. */}
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={Boolean(withdrawal.handled_at)}
                      onCheckedChange={(handled) => update.mutate({ id: withdrawal.id, handled })}
                      aria-label={`Recesso di ${withdrawal.name} gestito`}
                    />
                    <Text size="small" className={withdrawal.handled_at ? 'text-ui-fg-subtle' : 'text-ui-tag-orange-text'}>
                      {withdrawal.handled_at ? 'Gestito' : 'Da gestire'}
                    </Text>
                  </label>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: 'Recessi',
  icon: ArrowUturnLeft,
})

export default WithdrawalsPage
