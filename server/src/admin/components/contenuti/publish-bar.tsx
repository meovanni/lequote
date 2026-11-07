import { CheckCircleSolid, ExclamationCircleSolid } from '@medusajs/icons'
import { Button, Heading, Text, usePrompt } from '@medusajs/ui'
import { useDiscardDrafts, usePublish, type ContentStatus } from '../../lib/contenuti-api'

const formatTime = (value: string) =>
  new Date(value).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Rome' })

const changes = (count: number) => (count === 1 ? '1 modifica' : `${count} modifiche`)

/** Cosa sta succedendo: modifiche in attesa, pubblicazione in corso, esito dell'ultima. */
function StatusLine({ status }: { status: ContentStatus }) {
  const { pending, publication, rebuilds } = status
  if (publication?.status === 'running') {
    return (
      <Text size="small" className="text-ui-fg-subtle">
        {rebuilds ? 'Pubblicazione in corso: il sito si sta aggiornando, ci vuole circa un minuto…' : 'Pubblicazione in corso…'}
      </Text>
    )
  }
  if (publication?.status === 'failed') {
    return (
      <div className="flex flex-col gap-1">
        <Text size="small" className="flex items-center gap-1 text-ui-fg-error">
          <ExclamationCircleSolid />
          L’ultima pubblicazione ({formatTime(publication.created_at)}) non è riuscita: il sito è rimasto com’era.
        </Text>
        {publication.error && (
          <details>
            <summary className="txt-compact-xsmall cursor-pointer text-ui-fg-subtle">Dettagli per l’assistenza</summary>
            <pre className="txt-compact-xsmall mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-ui-fg-subtle">{publication.error}</pre>
          </details>
        )}
      </div>
    )
  }
  if (pending > 0) {
    return (
      <Text size="small" className="text-ui-tag-orange-text">
        {changes(pending)} non ancora sul sito. Premi “Pubblica” quando hai finito.
      </Text>
    )
  }
  return (
    <Text size="small" className="flex items-center gap-1 text-ui-fg-subtle">
      <CheckCircleSolid className="text-ui-tag-green-icon" />
      {publication?.finished_at ? `Tutto online. Ultima pubblicazione: ${formatTime(publication.finished_at)}.` : 'Tutto online.'}
    </Text>
  )
}

/** Testata della pagina: titolo, stato e i due pulsanti che agiscono su tutte le modifiche. */
export function PublishBar({ status }: { status: ContentStatus }) {
  const publish = usePublish()
  const discard = useDiscardDrafts()
  const prompt = usePrompt()
  const running = status.publication?.status === 'running'

  const onDiscard = async () => {
    const confirmed = await prompt({
      title: 'Annullare le modifiche?',
      description: `${changes(status.pending)} non ancora pubblicate torneranno come sono sul sito adesso.`,
      confirmText: 'Annulla le modifiche',
      cancelText: 'Indietro',
    })
    if (confirmed) discard.mutate()
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
      <div className="flex max-w-2xl flex-col gap-1">
        <Heading level="h1">Contenuti del sito</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Testi e foto di tutte le pagine, in italiano, inglese e tedesco. Le modifiche si salvano da sole in bozza e vanno
          online tutte insieme con “Pubblica”. Svuota un campo per tornare al testo di partenza.
        </Text>
        <StatusLine status={status} />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="small" disabled={status.pending === 0 || running} isLoading={discard.isPending} onClick={onDiscard}>
          Annulla modifiche
        </Button>
        <Button size="small" disabled={status.pending === 0 || running} isLoading={publish.isPending || running} onClick={() => publish.mutate()}>
          Pubblica{status.pending > 0 ? ` (${status.pending})` : ''}
        </Button>
      </div>
    </div>
  )
}
