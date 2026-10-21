import { Input, Table, Text } from '@medusajs/ui'
import { FormField } from '../form-field'
import { formatEuro, type Period, type RankingRow, type Summary } from '../../lib/sales-api'

/** Filtro del periodo per riepiloghi e classifiche: estremi compresi, vuoto = da sempre. */
export function PeriodFilter({ period, onChange }: { period: Period; onChange: (period: Period) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <FormField id="period-from" label="Dal">
        <Input id="period-from" type="date" value={period.from ?? ''} onChange={(event) => onChange({ ...period, from: event.target.value || undefined })} />
      </FormField>
      <FormField id="period-to" label="Al">
        <Input id="period-to" type="date" value={period.to ?? ''} onChange={(event) => onChange({ ...period, to: event.target.value || undefined })} />
      </FormField>
    </div>
  )
}

export function SummaryFigures({ summary }: { summary: Summary }) {
  const figures = [
    ['Ordini', String(summary.orders)],
    ['Pezzi', String(summary.quantity)],
    ['Venduto', formatEuro(summary.revenue)],
    ['Incassato', formatEuro(summary.paid)],
    ['Da incassare', formatEuro(summary.outstanding)],
  ]
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {figures.map(([label, value]) => (
        <div key={label}>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {label}
          </Text>
          <Text weight="plus">{value}</Text>
        </div>
      ))}
    </div>
  )
}

export function ByProductTable({ summary }: { summary: Summary }) {
  if (summary.byProduct.length === 0) return <Text size="small" className="text-ui-fg-subtle">Nessuna vendita nel periodo.</Text>
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Prodotto</Table.HeaderCell>
          <Table.HeaderCell>Pezzi</Table.HeaderCell>
          <Table.HeaderCell>Venduto</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {summary.byProduct.map((row) => (
          <Table.Row key={row.sku || row.label}>
            <Table.Cell>{row.label}</Table.Cell>
            <Table.Cell>{row.quantity}</Table.Cell>
            <Table.Cell>{formatEuro(row.total)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export function ByCustomerTable({ summary }: { summary: Summary }) {
  if (summary.byCustomer.length === 0) return <Text size="small" className="text-ui-fg-subtle">Nessun cliente nel periodo.</Text>
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Cliente</Table.HeaderCell>
          <Table.HeaderCell>Ordini</Table.HeaderCell>
          <Table.HeaderCell>Pezzi</Table.HeaderCell>
          <Table.HeaderCell>Venduto</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {summary.byCustomer.map((row) => (
          <Table.Row key={row.customer}>
            <Table.Cell>{row.customer}</Table.Cell>
            <Table.Cell>{row.orders}</Table.Cell>
            <Table.Cell>{row.quantity}</Table.Cell>
            <Table.Cell>{formatEuro(row.total)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export function RankingTable({ ranking }: { ranking: RankingRow[] }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>Agente</Table.HeaderCell>
          <Table.HeaderCell>Venduto</Table.HeaderCell>
          <Table.HeaderCell>Pezzi</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {ranking.map((row) => (
          <Table.Row key={`${row.position}-${row.name}`} className={row.me ? 'bg-ui-bg-highlight' : undefined}>
            <Table.Cell>{row.position}</Table.Cell>
            <Table.Cell>
              {row.name}
              {row.me ? ' (tu)' : ''}
            </Table.Cell>
            <Table.Cell>{formatEuro(row.revenue)}</Table.Cell>
            <Table.Cell>{row.quantity}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
