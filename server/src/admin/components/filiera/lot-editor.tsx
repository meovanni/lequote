import { ExclamationCircle } from '@medusajs/icons'
import { Button, Text, usePrompt } from '@medusajs/ui'
import { suppliersFor, toDateInput, useFilieraAction, useLot, useSuppliers, type Lot } from '../../lib/filiera-api'
import { InlineSelect, InlineText, Labeled } from '../inline/inline-fields'
import { LotQrPanel } from './lot-qr-panel'
import { StagesEditor } from './stages-editor'

// Il lotto aperto sotto la sua riga: dati di etichetta che si salvano da soli, fasi di filiera,
// pubblicazione e QR. Niente scheda a parte.

function LabelFields({ lot }: { lot: Lot }) {
  const action = useFilieraAction()
  const suppliers = useSuppliers()
  const establishments = suppliersFor(suppliers.data?.items ?? [], ['imbottigliamento', 'invasettamento', 'laboratorio'])
  const save = (body: Record<string, unknown>) => action.mutate({ path: `/admin/filiera/lots/${lot.id}`, body, success: 'Salvato.' })

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <Labeled label="Denominazione di vendita">
        <InlineText value={lot.product_name} label="Denominazione di vendita" required onSave={(value) => save({ product_name: value })} />
      </Labeled>
      <Labeled label="Quantità nominale">
        <InlineText value={lot.nominal_quantity} label="Quantità nominale" placeholder="es. 0,75 l" onSave={(value) => save({ nominal_quantity: value })} />
      </Labeled>
      <Labeled label="Origine">
        <InlineText value={lot.origin} label="Origine" required onSave={(value) => save({ origin: value })} />
      </Labeled>
      <Labeled label="Stabilimento di confezionamento">
        <InlineSelect
          value={lot.packaging_establishment_id}
          label="Stabilimento di confezionamento"
          emptyLabel="Non indicato"
          options={establishments.map((item) => ({ value: item.id, label: `${item.name}, ${item.municipality}` }))}
          onSave={(value) => save({ packaging_establishment_id: value })}
        />
      </Labeled>
      <Labeled label="Data di confezionamento">
        <InlineText type="date" value={toDateInput(lot.packaging_date)} label="Data di confezionamento" onSave={(value) => save({ packaging_date: value })} />
      </Labeled>
      <Labeled label="Da consumarsi preferibilmente entro">
        <InlineText type="date" value={toDateInput(lot.best_before)} label="Termine minimo di conservazione" onSave={(value) => save({ best_before: value })} />
      </Labeled>
      <Labeled label="Pezzi prodotti" hint="Interno, non pubblicato.">
        <InlineText value={lot.units === null ? '' : String(lot.units)} label="Pezzi prodotti" onSave={(value) => save({ units: value === null ? null : Number(value) })} />
      </Labeled>
      <Labeled label="Note interne">
        <InlineText multiline value={lot.notes} label="Note interne" onSave={(value) => save({ notes: value })} />
      </Labeled>
    </div>
  )
}

function PublishBox({ lot, blockers, publicUrl }: { lot: Lot; blockers: string[]; publicUrl: string | null }) {
  const action = useFilieraAction()
  const prompt = usePrompt()
  const published = lot.status === 'published'

  const remove = async () => {
    const confirmed = await prompt({
      title: `Eliminare il lotto ${lot.code}?`,
      description: 'Il lotto è in bozza: non è mai stato visibile al pubblico. Le sue fasi vengono eliminate con lui.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/lots/${lot.id}`, method: 'DELETE', success: 'Lotto eliminato.' })
  }

  return (
    <div className="flex flex-col gap-3">
      {published ? (
        <Text size="small">Pubblicato: chi inquadra il QR vede la pagina del lotto.</Text>
      ) : blockers.length > 0 ? (
        <ul className="flex flex-col gap-1" aria-label="Da completare per pubblicare">
          {blockers.map((blocker) => (
            <li key={blocker} className="flex items-start gap-2">
              <ExclamationCircle className="mt-0.5 shrink-0 text-ui-tag-orange-icon" />
              <Text size="small">{blocker}</Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="small">Dati completi: si può pubblicare.</Text>
      )}
      <div className="flex flex-wrap gap-2">
        {published ? (
          <>
            {publicUrl && (
              <Button asChild size="small" variant="secondary">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  Apri la pagina
                </a>
              </Button>
            )}
            <Button size="small" variant="secondary" isLoading={action.isPending} onClick={() => action.mutate({ path: `/admin/filiera/lots/${lot.id}/unpublish`, success: 'Lotto ritirato dalla pubblicazione.' })}>
              Ritira
            </Button>
          </>
        ) : (
          <>
            <Button size="small" disabled={blockers.length > 0} isLoading={action.isPending} onClick={() => action.mutate({ path: `/admin/filiera/lots/${lot.id}/publish`, success: 'Lotto pubblicato.' })}>
              Pubblica
            </Button>
            <Button size="small" variant="transparent" className="text-ui-fg-error" onClick={() => void remove()}>
              Elimina bozza
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function LotEditor({ lotId }: { lotId: string }) {
  const detail = useLot(lotId)
  if (detail.isLoading) return <div className="m-4 h-40 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  if (!detail.data) return <Text className="px-6 py-4 text-ui-fg-error">Lotto non trovato.</Text>
  const { lot, publish_blockers: blockers, public_url: publicUrl, qr_url: qrUrl } = detail.data

  return (
    <div className="grid grid-cols-1 gap-4 bg-ui-bg-subtle px-6 py-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <section className="flex flex-col gap-2">
          <Text size="small" weight="plus">Dati di etichetta</Text>
          <LabelFields lot={lot} />
        </section>
        <StagesEditor key={`stages-${lot.id}-${lot.stages?.length ?? 0}`} lot={lot} />
      </div>
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <Text size="small" weight="plus">Pubblicazione</Text>
          <PublishBox lot={lot} blockers={blockers} publicUrl={publicUrl} />
        </section>
        <LotQrPanel lot={lot} qrUrl={qrUrl} />
      </div>
    </div>
  )
}
