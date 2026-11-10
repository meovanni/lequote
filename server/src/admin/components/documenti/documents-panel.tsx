import { Button, Container, Heading, Text, clx, usePrompt } from '@medusajs/ui'
import { useEffect, useRef, useState } from 'react'
import { documentPdfUrl, invoiceSummaryUrl, useDocuments, type DocumentKind, type DocumentRow } from '../../lib/documenti-api'
import { formatEuro, useSalesAction } from '../../lib/sales-api'
import { scrollIntoMain } from '../../lib/scroll'
import { InvoiceForm } from './invoice-form'

// DDT e fatture emessi, nella pagina Gestione sotto gli ordini. Le fatture sono copie di
// cortesia: quella valida la emette il commercialista, a cui va il riepilogo CSV.

type Filter = DocumentKind | 'tutti'

function Row({ document }: { document: DocumentRow }) {
  const action = useSalesAction()
  const prompt = usePrompt()
  const canceled = document.status === 'canceled'
  const cancel = async () => {
    const confirmed = await prompt({
      title: `Annullare ${document.label}?`,
      description: 'Il numero resta usato e il documento resta nell’elenco come annullato. Per gli ordini se ne può fare uno nuovo.',
      confirmText: 'Annulla il documento',
      cancelText: 'Lascia così',
    })
    if (confirmed) action.mutate({ path: `/admin/documenti/${document.id}/annulla`, success: 'Documento annullato.' })
  }
  return (
    <tr className={clx('border-b border-ui-border-base', canceled && 'text-ui-fg-muted')}>
      <td className="px-6 py-2">
        <Text size="small" weight="plus" className={clx(canceled && 'line-through')}>
          {document.label}
        </Text>
      </td>
      <td className="px-3 py-2">
        <Text size="small">{document.customer}</Text>
      </td>
      <td className="lq-figure px-3 py-2 text-right">
        <Text size="small">{document.total === null ? '' : formatEuro(document.total)}</Text>
      </td>
      <td className="px-6 py-2">
        <div className="flex justify-end gap-1">
          {canceled && (
            <Text size="small" className="self-center pr-2">
              Annullato
            </Text>
          )}
          <Button size="small" variant="secondary" asChild>
            <a href={documentPdfUrl(document.id)} target="_blank" rel="noreferrer">
              PDF
            </a>
          </Button>
          {!canceled && (
            <Button size="small" variant="transparent" onClick={() => void cancel()}>
              Annulla
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

export function DocumentsPanel() {
  const documents = useDocuments()
  const [filter, setFilter] = useState<Filter>('tutti')
  const [creating, setCreating] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (creating) scrollIntoMain(formRef.current)
  }, [creating])

  const data = documents.data
  const rows = (data?.documents ?? []).filter((document) => filter === 'tutti' || document.kind === filter)

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div>
          <Heading level="h2">DDT e fatture</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Il DDT si prepara dal dettaglio dell’ordine. Le fatture sono copie di cortesia: quella valida la emette il commercialista.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['tutti', 'ddt', 'fattura'] as const).map((value) => (
            <Button key={value} size="small" variant={filter === value ? 'primary' : 'transparent'} onClick={() => setFilter(value)}>
              {value === 'tutti' ? 'Tutti' : value === 'ddt' ? 'DDT' : 'Fatture'}
            </Button>
          ))}
          {data && (
            <Button size="small" variant="secondary" asChild>
              <a href={invoiceSummaryUrl(data.year)} download>
                Riepilogo fatture {data.year}
              </a>
            </Button>
          )}
          <Button size="small" onClick={() => setCreating(true)} disabled={!data}>
            Nuova fattura
          </Button>
        </div>
      </div>
      {creating && data && (
        <div ref={formRef} className="scroll-mt-4 px-6 py-5">
          <InvoiceForm nextNumber={data.next.fattura} onDone={() => setCreating(false)} />
        </div>
      )}
      {!data ? (
        <div className="m-6 h-24 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
      ) : rows.length === 0 ? (
        <Text size="small" className="px-6 py-6 text-ui-fg-subtle">
          Nessun documento.
        </Text>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {rows.map((document) => (
                <Row key={document.id} document={document} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  )
}
