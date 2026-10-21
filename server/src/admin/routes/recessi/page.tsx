import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ArrowUturnLeft } from '@medusajs/icons'
import { Button, Container, Heading, StatusBadge, Switch, Table, Text, toast } from '@medusajs/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
}

const KEY = ['recessi']

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Rome' })
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
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      sdk.client.fetch(`/admin/withdrawals/${id}`, { method: 'POST', body: { handled } }),
    onSuccess: (_data, { handled }) => {
      queryClient.invalidateQueries({ queryKey: KEY })
      toast.success(handled ? 'Recesso segnato come gestito.' : 'Recesso riaperto.')
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
      {isLoading && <Text className="px-6 py-4 text-ui-fg-subtle">Caricamento…</Text>}
      {data && data.withdrawals.length === 0 && (
        <Text className="px-6 py-8 text-ui-fg-subtle">{onlyOpen ? 'Nessun recesso da gestire.' : 'Nessun recesso ricevuto.'}</Text>
      )}
      {data && data.withdrawals.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Inviato</Table.HeaderCell>
              <Table.HeaderCell>Cliente</Table.HeaderCell>
              <Table.HeaderCell>Ordine</Table.HeaderCell>
              <Table.HeaderCell>Prodotti o note</Table.HeaderCell>
              <Table.HeaderCell>Stato</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.withdrawals.map((withdrawal) => (
              <Table.Row key={withdrawal.id}>
                <Table.Cell>{formatTimestamp(withdrawal.submitted_at)}</Table.Cell>
                <Table.Cell>
                  {withdrawal.name}
                  <br />
                  <span className="text-ui-fg-subtle">{withdrawal.email}</span>
                </Table.Cell>
                <Table.Cell>
                  {withdrawal.order_id ? (
                    <Link to={`/orders/${withdrawal.order_id}`} className="text-ui-fg-interactive">
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
                  <StatusBadge color={withdrawal.handled_at ? 'green' : 'orange'}>
                    {withdrawal.handled_at ? 'Gestito' : 'Da gestire'}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    variant="secondary"
                    isLoading={update.isPending && update.variables?.id === withdrawal.id}
                    onClick={() => update.mutate({ id: withdrawal.id, handled: !withdrawal.handled_at })}
                  >
                    {withdrawal.handled_at ? 'Riapri' : 'Segna gestito'}
                  </Button>
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
