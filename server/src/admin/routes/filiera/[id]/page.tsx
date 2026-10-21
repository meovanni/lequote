import { Alert, Button, Container, Heading, StatusBadge, Text, usePrompt } from '@medusajs/ui'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LotLabelForm } from '../../../components/filiera/lot-label-form'
import { LotQrPanel } from '../../../components/filiera/lot-qr-panel'
import { StagesEditor } from '../../../components/filiera/stages-editor'
import { LINE_LABEL, useFilieraAction, useLot } from '../../../lib/filiera-api'

const LotDetailPage = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { data, isLoading, isError } = useLot(id)
  const action = useFilieraAction()

  if (isLoading) return <Text className="text-ui-fg-subtle">Caricamento…</Text>
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
      <Container className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-1">
          <Link to="/filiera" className="text-ui-fg-subtle txt-compact-small">
            ‹ Tutti i lotti
          </Link>
          <div className="flex items-center gap-3">
            <Heading level="h1" className="font-mono">
              {lot.code}
            </Heading>
            <StatusBadge color={published ? 'green' : 'grey'}>{published ? 'Pubblicato' : 'Bozza'}</StatusBadge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {LINE_LABEL[lot.product_line]}, campagna {lot.campaign?.label ?? 'non indicata'}
          </Text>
        </div>
        <div className="flex gap-2">
          {!published && (
            <Button variant="danger" size="small" onClick={remove}>
              Elimina
            </Button>
          )}
          {published ? (
            <Button
              variant="secondary"
              size="small"
              isLoading={action.isPending}
              onClick={() => action.mutate({ path: `/admin/filiera/lots/${lot.id}/unpublish`, success: 'Lotto ritirato dalla pubblicazione.' })}
            >
              Ritira dalla pubblicazione
            </Button>
          ) : (
            <Button
              size="small"
              disabled={blockers.length > 0}
              isLoading={action.isPending}
              onClick={() => action.mutate({ path: `/admin/filiera/lots/${lot.id}/publish`, success: 'Lotto pubblicato.' })}
            >
              Pubblica
            </Button>
          )}
        </div>
      </Container>

      {!published && blockers.length > 0 && (
        <Alert variant="warning">
          Per pubblicare il lotto mancano: {blockers.join(', ')}.
        </Alert>
      )}

      <LotLabelForm key={`label-${lot.id}`} lot={lot} />
      <LotQrPanel lot={lot} publicUrl={data.public_url} />
      <StagesEditor key={`stages-${lot.id}`} lot={lot} />
    </div>
  )
}

export default LotDetailPage
