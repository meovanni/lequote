import { Badge, clx, Table, Text } from '@medusajs/ui'
import type { ImportRow } from '../../../lib/order-import'
import { formatEuro } from '../../lib/sales-api'

/** Anteprima delle righe lette dal foglio: cosa diventa ordine, con avvisi ed errori riga per riga. */
export function OrderImportPreview({ rows }: { rows: ImportRow[] }) {
  const valid = rows.filter((row) => !row.error)
  const total = valid.reduce((sum, row) => sum + row.amount, 0)
  const errors = rows.length - valid.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <Text size="small">
          <span className="lq-figure txt-compact-medium-plus">{valid.length}</span> ordini da importare, totale{' '}
          <span className="lq-figure txt-compact-medium-plus">{formatEuro(total)}</span>
        </Text>
        {errors > 0 && (
          <Text size="small" className="text-ui-fg-error">
            {errors === 1 ? 'Una riga con errori verrà saltata.' : `${errors} righe con errori verranno saltate.`}
          </Text>
        )}
      </div>
      <div className="max-h-[50vh] overflow-auto rounded-lg border border-ui-border-base">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-16">Riga</Table.HeaderCell>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Litri</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Taniche</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Importo</Table.HeaderCell>
              <Table.HeaderCell>Note</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.line} className={clx(row.error && 'bg-ui-bg-subtle text-ui-fg-muted')}>
                <Table.Cell className="text-ui-fg-subtle">{row.line}</Table.Cell>
                <Table.Cell>{row.name || '-'}</Table.Cell>
                <Table.Cell className="text-right">{row.liters ?? '-'}</Table.Cell>
                <Table.Cell className="text-right">{row.error ? '-' : row.tanks}</Table.Cell>
                <Table.Cell className="text-right">
                  {row.error ? (
                    '-'
                  ) : (
                    <span className="flex items-center justify-end gap-2">
                      {!row.amountFromFile && (
                        <Badge size="2xsmall" color="grey">
                          listino
                        </Badge>
                      )}
                      {formatEuro(row.amount)}
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-xs whitespace-normal">
                  {row.error && (
                    <Text size="xsmall" className="text-ui-fg-error">
                      {row.error}
                    </Text>
                  )}
                  {row.warnings.map((warning) => (
                    <Text key={warning} size="xsmall" className="text-ui-tag-orange-text">
                      {warning}
                    </Text>
                  ))}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}
