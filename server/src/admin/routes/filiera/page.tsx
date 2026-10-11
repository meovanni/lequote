import { defineRouteConfig } from '@medusajs/admin-sdk'
import { ListTree } from '@medusajs/icons'
import { Container, Heading, Input, Select, StatusBadge, Table, Text } from '@medusajs/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LINE_LABEL, useLots, type ProductLine } from '../../lib/filiera-api'
import { NewLotDrawer } from '../../components/filiera/new-lot-drawer'

const ALL = 'tutti'

const FilieraLotsPage = () => {
  const navigate = useNavigate()
  const [line, setLine] = useState<string>(ALL)
  const [status, setStatus] = useState<string>(ALL)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useLots({
    ...(line !== ALL ? { product_line: line as ProductLine } : {}),
    ...(status !== ALL ? { status } : {}),
    ...(search.trim() ? { q: search.trim() } : {}),
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h1">Lotti</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Ogni lotto nasce in bozza e diventa consultabile dal pubblico solo quando i dati di etichetta sono completi.
          </Text>
        </div>
        <NewLotDrawer onCreated={(id) => navigate(`/filiera/${id}`)} />
      </div>

      <div className="flex flex-wrap gap-3 px-6 py-4">
        <Input
          size="small"
          type="search"
          placeholder="Cerca per codice o prodotto"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64"
        />
        <Select size="small" value={line} onValueChange={setLine}>
          <Select.Trigger className="w-40">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL}>Tutte le linee</Select.Item>
            <Select.Item value="olio">Olio</Select.Item>
            <Select.Item value="miele">Miele</Select.Item>
          </Select.Content>
        </Select>
        <Select size="small" value={status} onValueChange={setStatus}>
          <Select.Trigger className="w-40">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL}>Tutti gli stati</Select.Item>
            <Select.Item value="draft">Bozze</Select.Item>
            <Select.Item value="published">Pubblicati</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {isError && <Text className="px-6 py-4 text-ui-fg-error">Non è stato possibile caricare i lotti.</Text>}
      {isLoading && <Text className="px-6 py-4 text-ui-fg-subtle">Caricamento…</Text>}
      {data && data.lots.length === 0 && (
        <Text className="px-6 py-8 text-ui-fg-subtle">Nessun lotto. Crea il primo con «Nuovo lotto».</Text>
      )}
      {data && data.lots.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Codice</Table.HeaderCell>
              <Table.HeaderCell>Prodotto</Table.HeaderCell>
              <Table.HeaderCell>Linea</Table.HeaderCell>
              <Table.HeaderCell>Campagna</Table.HeaderCell>
              <Table.HeaderCell>Stato</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.lots.map((lot) => (
              <Table.Row key={lot.id} className="cursor-pointer" onClick={() => navigate(`/filiera/${lot.id}`)}>
                <Table.Cell className="font-mono">{lot.code}</Table.Cell>
                <Table.Cell>{lot.product_name}</Table.Cell>
                <Table.Cell>{LINE_LABEL[lot.product_line]}</Table.Cell>
                <Table.Cell>{lot.campaign?.label ?? ''}</Table.Cell>
                <Table.Cell>
                  <StatusBadge color={lot.status === 'published' ? 'green' : 'grey'}>
                    {lot.status === 'published' ? 'Pubblicato' : 'Bozza'}
                  </StatusBadge>
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
  label: 'Filiera',
  icon: ListTree,
})

export default FilieraLotsPage
