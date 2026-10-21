import { Badge, clx, Table, Text } from '@medusajs/ui'
import { formatEuro, type RankingRow, type Summary } from '../../lib/sales-api'

export { PeriodFilter } from './period-filter'

/**
 * I numeri del periodo: il venduto in grande, il resto accanto. "Da incassare" prende il colore
 * dell'ottone solo quando c'è davvero qualcosa da incassare.
 */
export function SummaryFigures({ summary }: { summary: Summary }) {
  const rest = [
    { label: 'Incassato', value: formatEuro(summary.paid) },
    { label: 'Da incassare', value: formatEuro(summary.outstanding), alert: summary.outstanding > 0 },
    { label: 'Ordini', value: String(summary.orders) },
    { label: 'Pezzi', value: String(summary.quantity) },
  ]
  return (
    <dl className="grid grid-cols-2 gap-y-4 md:grid-cols-[1.4fr_repeat(4,1fr)]">
      <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
        <dt>
          <Text size="small" className="text-ui-fg-subtle">
            Venduto
          </Text>
        </dt>
        <dd className="lq-figure text-[28px] font-medium leading-none tracking-tight text-ui-fg-base">{formatEuro(summary.revenue)}</dd>
      </div>
      {rest.map(({ label, value, alert }) => (
        <div key={label} className="flex flex-col gap-1 md:border-l md:border-ui-border-base md:pl-5">
          <dt>
            <Text size="small" className="text-ui-fg-subtle">
              {label}
            </Text>
          </dt>
          <dd className={clx('lq-figure text-lg font-medium leading-tight', alert ? 'text-ui-tag-orange-text' : 'text-ui-fg-base')}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Empty({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ui-border-strong px-6 py-8 text-center">
      <Text size="small" className="text-ui-fg-subtle">
        {children}
      </Text>
    </div>
  )
}

export function ByProductTable({ summary }: { summary: Summary }) {
  if (summary.byProduct.length === 0) return <Empty>Nessuna vendita nel periodo.</Empty>
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Prodotto</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Pezzi</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Venduto</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {summary.byProduct.map((row) => (
          <Table.Row key={row.sku || row.label}>
            <Table.Cell>{row.label}</Table.Cell>
            <Table.Cell className="text-right">{row.quantity}</Table.Cell>
            <Table.Cell className="text-right">{formatEuro(row.total)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export function ByCustomerTable({ summary }: { summary: Summary }) {
  if (summary.byCustomer.length === 0) return <Empty>Nessun cliente nel periodo.</Empty>
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Cliente</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Ordini</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Pezzi</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Venduto</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {summary.byCustomer.map((row) => (
          <Table.Row key={row.customer}>
            <Table.Cell>{row.customer}</Table.Cell>
            <Table.Cell className="text-right">{row.orders}</Table.Cell>
            <Table.Cell className="text-right">{row.quantity}</Table.Cell>
            <Table.Cell className="text-right">{formatEuro(row.total)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

/** Classifica per venduto: la barra dice a colpo d'occhio la distanza dal primo. */
export function RankingTable({ ranking }: { ranking: RankingRow[] }) {
  if (ranking.length === 0) return <Empty>Nessun agente attivo.</Empty>
  const top = Math.max(...ranking.map((row) => row.revenue), 0)
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell className="w-12">#</Table.HeaderCell>
          <Table.HeaderCell>Agente</Table.HeaderCell>
          <Table.HeaderCell>Venduto</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Pezzi</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {ranking.map((row) => (
          <Table.Row key={`${row.position}-${row.name}`} className={row.me ? 'bg-ui-bg-highlight hover:bg-ui-bg-highlight-hover' : undefined}>
            <Table.Cell className={clx('lq-figure', row.position === 1 && row.revenue > 0 ? 'font-medium text-ui-fg-interactive' : 'text-ui-fg-subtle')}>
              {row.position}
            </Table.Cell>
            <Table.Cell>
              <span className="flex items-center gap-2">
                {row.name}
                {row.me && (
                  <Badge size="2xsmall" color="orange">
                    Tu
                  </Badge>
                )}
              </span>
            </Table.Cell>
            <Table.Cell>
              <span className="flex items-center gap-3">
                <span className="lq-figure w-24">{formatEuro(row.revenue)}</span>
                {top > 0 && row.revenue > 0 && (
                  <span aria-hidden className="hidden h-1.5 rounded-full bg-ui-fg-interactive sm:block" style={{ width: `${Math.max(4, (row.revenue / top) * 120)}px` }} />
                )}
              </span>
            </Table.Cell>
            <Table.Cell className="text-right">{row.quantity}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
