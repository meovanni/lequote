import { ArrowLeftMini, ArrowUpRightOnBox, CheckCircleSolid, ExclamationCircle } from '@medusajs/icons'
import { Button, Container, Heading, StatusBadge, Text, usePrompt } from '@medusajs/ui'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LotLabelForm } from '../../../components/filiera/lot-label-form'
import { LotQrPanel } from '../../../components/filiera/lot-qr-panel'
import { StagesEditor } from '../../../components/filiera/stages-editor'
import { LINE_LABEL, useFilieraAction, useLot, type Lot } from '../../../lib/filiera-api'

/**
 * Scheda lotto, sul modello delle schede di Medusa: a sinistra dati di etichetta e fasi, a destra
 * pubblicazione (con quello che manca) e QR per l'etichetta.
 */
const LotDetailPage = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { data, isLoading, isError } = useLot(id)
  const action = useFilieraAction()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-3" aria-label="Caricamento">
        <div className="h-24 animate-pulse rounded-lg bg-ui-bg-component" />
        <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" />
      </div>
    )
  }
  if (isError || !data) return <Text className="text-ui-fg-error">Lotto non trovato.</Text>

  const { lot, publish_blockers: blockers } = data
  const published = lot.status === 'published'

  const remove = async () => {
    const confirmed = await prompt({
      title: `Eliminare il lotto ${lot.code}?`,
      description: 'Il lotto è in bozza: non è mai stato visibile al pubblico. Le sue fasi vengono eliminate con lui.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (!confirmed) return
    action.mutate(
      { path: `/admin/filiera/lots/${lot.id}`, method: 'DELETE', success: 'Lotto eliminato.' },
      { onSuccess: () => navigate('/filiera') },
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-3 px-6 py-5">
        <Link to="/filiera" className="flex w-fit items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base">
          <ArrowLeftMini />
          <span className="txt-compact-small">Tutti i lotti</span>
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Heading level="h1" className="font-mono">
                {lot.code}
              </Heading>
              <StatusBadge color={published ? 'green' : 'grey'}>{published ? 'Pubblicato' : 'Bozza'}</StatusBadge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {lot.product_name}, campagna {LINE_LABEL[lot.product_line].toLowerCase()} {lot.campaign?.label ?? 'non indicata'}
            </Text>
          </div>
          {!published && (
            <Button variant="secondary" size="small" onClick={remove}>
              Elimina bozza
            </Button>
          )}
        </div>
      </Container>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-y-3">
          <LotLabelForm key={`label-${lot.id}`} lot={lot} />
          <StagesEditor key={`stages-${lot.id}`} lot={lot} />
        </div>
        <div className="flex w-full flex-col gap-y-3 xl:sticky xl:top-3 xl:w-[400px]">
          <PublishPanel lot={lot} blockers={blockers} publicUrl={data.public_url} pending={action.isPending} onAction={(path, success) => action.mutate({ path, success })} />
          <LotQrPanel lot={lot} publicUrl={data.public_url} />
        </div>
      </div>
    </div>
  )
}

type PublishPanelProps = {
  lot: Lot
  blockers: string[]
  publicUrl: string | null
  pending: boolean
  onAction: (path: string, success: string) => void
}

/** Stato della pubblicazione: cosa manca per pubblicare, oppure il link alla pagina pubblica. */
function PublishPanel({ lot, blockers, publicUrl, pending, onAction }: PublishPanelProps) {
  const published = lot.status === 'published'
  return (
    <Container className="flex flex-col gap-4 px-6 py-5">
      <div>
        <Heading level="h2">Pubblicazione</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {published
            ? 'Il lotto è consultabile da chiunque inquadri il QR.'
            : blockers.length > 0
              ? 'Il lotto diventa pubblico quando i dati di etichetta sono completi.'
              : 'Dati completi: il lotto si può pubblicare.'}
        </Text>
      </div>

      {!published && blockers.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Da completare">
          {blockers.map((blocker) => (
            <li key={blocker} className="flex items-start gap-2">
              <ExclamationCircle className="mt-0.5 shrink-0 text-ui-tag-orange-icon" />
              <Text size="small">{blocker}</Text>
            </li>
          ))}
        </ul>
      )}
      {!published && blockers.length === 0 && (
        <div className="flex items-center gap-2">
          <CheckCircleSolid className="text-ui-tag-green-icon" />
          <Text size="small">Pronto per la pubblicazione</Text>
        </div>
      )}

      {published ? (
        <div className="flex flex-wrap gap-2">
          {publicUrl && (
            <Button asChild size="small" variant="secondary">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRightOnBox />
                Apri la pagina
              </a>
            </Button>
          )}
          <Button variant="secondary" size="small" isLoading={pending} onClick={() => onAction(`/admin/filiera/lots/${lot.id}/unpublish`, 'Lotto ritirato dalla pubblicazione.')}>
            Ritira dalla pubblicazione
          </Button>
        </div>
      ) : (
        <Button size="small" className="w-fit" disabled={blockers.length > 0} isLoading={pending} onClick={() => onAction(`/admin/filiera/lots/${lot.id}/publish`, 'Lotto pubblicato.')}>
          Pubblica
        </Button>
      )}
    </Container>
  )
}

export default LotDetailPage
