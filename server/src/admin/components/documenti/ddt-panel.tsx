import { Button, Input, Text, usePrompt } from '@medusajs/ui'
import { useEffect, useState } from 'react'
import { FormField } from '../form-field'
import { documentPdfUrl, refLabel, useDdtDraft, type DocumentRef, type Party } from '../../lib/documenti-api'
import { useSalesAction } from '../../lib/sales-api'
import { PartyFields } from './party-fields'

// Il DDT di un ordine, nel suo dettaglio: si prepara con i dati dell'ordine, si emette e si
// stampa. Per gli agenti (area vendita) le stesse azioni sulle loro rotte, senza annullamento.

type Carrier = 'mittente' | 'destinatario' | 'vettore'

type Props = {
  orderId: string
  ddt: DocumentRef | undefined
  canceled: boolean
  /** Rotta del DDT dell'ordine: GET i dati di partenza, POST l'emissione. */
  path: string
  /** Indirizzo del PDF già emesso. */
  pdfUrl?: string
  /** Solo i titolari annullano un DDT. */
  canCancel?: boolean
}

const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value.replace(',', '.')))

function DdtForm({ path, onDone }: { path: string; onDone: () => void }) {
  const draft = useDdtDraft(path, true)
  const action = useSalesAction()
  const [recipient, setRecipient] = useState<Party | null>(null)
  const [destination, setDestination] = useState('')
  const [carrier, setCarrier] = useState<Carrier>('mittente')
  const [carrierName, setCarrierName] = useState('')
  const [packages, setPackages] = useState('')
  const [appearance, setAppearance] = useState('Scatole')
  const [weight, setWeight] = useState('')
  const [lots, setLots] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!draft.data || recipient) return
    setRecipient(draft.data.draft.recipient)
    setPackages(draft.data.draft.packages === null ? '' : String(draft.data.draft.packages))
    setLots(draft.data.draft.lines.map(() => ''))
  }, [draft.data, recipient])

  if (!draft.data || !recipient) return <div className="h-40 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    action.mutate(
      {
        path,
        body: { recipient, destination, carrier, carrierName, packages: numberOrNull(packages), appearance, weightKg: numberOrNull(weight), lots, notes },
        success: 'DDT emesso.',
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-ui-border-base bg-ui-bg-base p-4">
      <Text size="small" weight="plus">
        Destinatario
      </Text>
      <PartyFields id={`ddt-${path}`} party={recipient} onChange={setRecipient} />
      <FormField id="ddt-destination" label="Luogo di destinazione" hint="Solo se la merce va altrove rispetto all'indirizzo qui sopra.">
        <Input id="ddt-destination" size="small" value={destination} onChange={(event) => setDestination(event.target.value)} />
      </FormField>

      <div className="flex flex-col gap-2">
        <Text size="small" weight="plus">
          Lotti
        </Text>
        {draft.data.draft.lines.map((line, index) => (
          <div key={index} className="grid grid-cols-[1fr_8rem] items-center gap-2">
            <Text size="small">
              {line.description} · {line.quantity} {line.unit}
            </Text>
            <Input
              size="small"
              aria-label={`Lotto di ${line.description}`}
              placeholder="Lotto"
              value={lots[index] ?? ''}
              onChange={(event) => setLots(lots.map((lot, position) => (position === index ? event.target.value : lot)))}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FormField id="ddt-carrier" label="Trasporto a cura del">
          <select
            id="ddt-carrier"
            value={carrier}
            onChange={(event) => setCarrier(event.target.value as Carrier)}
            className="txt-compact-small h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2"
          >
            <option value="mittente">Mittente</option>
            <option value="destinatario">Destinatario</option>
            <option value="vettore">Vettore</option>
          </select>
        </FormField>
        {carrier === 'vettore' && (
          <FormField id="ddt-carrier-name" label="Vettore">
            <Input id="ddt-carrier-name" size="small" value={carrierName} onChange={(event) => setCarrierName(event.target.value)} />
          </FormField>
        )}
        <FormField id="ddt-packages" label="Colli">
          <Input id="ddt-packages" size="small" inputMode="numeric" value={packages} onChange={(event) => setPackages(event.target.value)} />
        </FormField>
        <FormField id="ddt-appearance" label="Aspetto dei beni">
          <Input id="ddt-appearance" size="small" value={appearance} onChange={(event) => setAppearance(event.target.value)} />
        </FormField>
        <FormField id="ddt-weight" label="Peso lordo (kg)">
          <Input id="ddt-weight" size="small" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} />
        </FormField>
      </div>
      <FormField id="ddt-notes" label="Note">
        <Input id="ddt-notes" size="small" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </FormField>
      <div className="flex items-center justify-end gap-2">
        <Button size="small" variant="transparent" type="button" onClick={onDone}>
          Annulla
        </Button>
        <Button size="small" type="submit" isLoading={action.isPending}>
          Emetti DDT
        </Button>
      </div>
    </form>
  )
}

export function DdtPanel({ orderId, ddt, canceled, path, pdfUrl, canCancel = false }: Props) {
  const [open, setOpen] = useState(false)
  const action = useSalesAction()
  const prompt = usePrompt()

  if (ddt) {
    const cancel = async () => {
      const confirmed = await prompt({
        title: `Annullare il DDT n. ${ddt.number}/${ddt.year}?`,
        description: 'Il numero resta usato e il DDT resta nell’elenco come annullato. Per l’ordine se ne può fare uno nuovo.',
        confirmText: 'Annulla il DDT',
        cancelText: 'Lascia così',
      })
      if (confirmed) action.mutate({ path: `/admin/documenti/${ddt.id}/annulla`, success: 'DDT annullato.' })
    }
    return (
      <div className="flex flex-col gap-1">
        <Text size="small" weight="plus">
          Documento di trasporto
        </Text>
        <div className="flex flex-wrap items-center gap-2">
          <Text size="small">{refLabel('ddt', ddt)}</Text>
          <Button size="small" variant="secondary" asChild>
            <a href={pdfUrl ?? documentPdfUrl(ddt.id)} target="_blank" rel="noreferrer">
              Apri PDF
            </a>
          </Button>
          {canCancel && (
            <Button size="small" variant="transparent" onClick={() => void cancel()}>
              Annulla DDT
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (canceled) return null
  return (
    <div className="flex flex-col gap-2">
      <Text size="small" weight="plus">
        Documento di trasporto
      </Text>
      {open ? (
        <DdtForm key={orderId} path={path} onDone={() => setOpen(false)} />
      ) : (
        <Button size="small" variant="secondary" className="self-start" onClick={() => setOpen(true)}>
          Prepara il DDT
        </Button>
      )}
    </div>
  )
}
