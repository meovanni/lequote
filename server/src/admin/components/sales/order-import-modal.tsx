import { Button, FocusModal, Heading, Input, Select, Text, toast } from '@medusajs/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { planImport, type ImportRow } from '../../../lib/order-import'
import { FormField } from '../form-field'
import { useGuardedOpen } from '../use-guarded-open'
import { OrderImportPreview } from './order-import-preview'
import { readFirstSheet, sendImport, type ImportOutcome } from '../../lib/order-import-api'
import { formatEuro, useBackofficeCatalog, type Catalog } from '../../lib/sales-api'

const NONE = 'nessuno'

type Step = { kind: 'file' } | { kind: 'preview'; sheet: unknown[][]; fileName: string } | { kind: 'sending'; done: number; total: number } | { kind: 'done'; outcomes: ImportOutcome[]; names: Map<number, string> }

/**
 * Scala la disponibilità riga per riga, nell'ordine del foglio, e avvisa sulle righe che non la
 * troveranno più. Il controllo vero è sul server, riga per riga.
 */
function withStockWarnings(rows: ImportRow[], available: number | null): ImportRow[] {
  if (available === null) return rows
  return rows.reduce<{ left: number; rows: ImportRow[] }>(
    (acc, row) => {
      if (row.error) return { ...acc, rows: [...acc.rows, row] }
      if (row.tanks <= acc.left) return { left: acc.left - row.tanks, rows: [...acc.rows, row] }
      const warning = `Probabilmente non disponibile: ${acc.left > 0 ? `restano ${acc.left} taniche` : 'taniche esaurite'} dopo le righe sopra.`
      return { ...acc, rows: [...acc.rows, { ...row, warnings: [...row.warnings, warning] }] }
    },
    { left: available, rows: [] },
  ).rows
}

/** Formato della tanica, se il catalogo ce l'ha: la latta d'olio da 5 L. */
const defaultVariant = (catalog: Catalog) =>
  catalog.variants.find((variant) => variant.sku === 'OLIO-5L') ?? catalog.variants.find((variant) => /5\s*l/i.test(variant.variant)) ?? catalog.variants[0]

/**
 * Importa da Excel: un ordine per riga del foglio (Nome, L, Taniche facoltativa, Importo
 * facoltativo). Prima l'anteprima con avvisi ed errori, poi l'invio a gruppi e il riepilogo.
 */
export function OrderImportModal() {
  const [status, setStatus] = useState<FlowStatus>(IDLE)
  const { open, onOpenChange, close, contentProps } = useGuardedOpen({
    dirty: status.dirty,
    busy: status.busy ? 'Importazione in corso: attendi la fine.' : null,
    onDiscard: () => setStatus(IDLE),
  })
  const catalog = useBackofficeCatalog(open)

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          Importa da Excel
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content {...contentProps}>
        <FocusModal.Header />
        <FocusModal.Body className="flex justify-center overflow-y-auto px-6 py-8">
          <div className="flex w-full max-w-5xl flex-col gap-6">
            <div>
              <Heading level="h1">Importa ordini da Excel</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Un ordine per riga. Colonne: <strong>Nome</strong> (nome e cognome, o solo nome), <strong>L</strong> (litri), <strong>Taniche</strong>{' '}
                (facoltativa: se manca si contano dai litri), <strong>Importo</strong> (facoltativo: se manca vale il listino).
              </Text>
            </div>
            {catalog.isLoading && <div className="h-48 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento del catalogo" />}
            {catalog.isError && <Text className="text-ui-fg-error">Catalogo non disponibile.</Text>}
            {catalog.data && <ImportFlow key={String(open)} catalog={catalog.data} onClose={close} onStatus={setStatus} />}
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

type FlowStatus = { dirty: boolean; busy: boolean }
const IDLE: FlowStatus = { dirty: false, busy: false }

type ImportFlowProps = { catalog: Catalog; onClose: () => void; onStatus: (status: FlowStatus) => void }

function ImportFlow({ catalog, onClose, onStatus }: ImportFlowProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>({ kind: 'file' })
  const [readError, setReadError] = useState<string | null>(null)
  const [variantId, setVariantId] = useState(defaultVariant(catalog)?.variantId ?? '')
  const [litersPerTank, setLitersPerTank] = useState('5')
  const [deliveryId, setDeliveryId] = useState(NONE)
  const [agentId, setAgentId] = useState(NONE)

  const variant = catalog.variants.find((item) => item.variantId === variantId)
  const plan = useMemo(() => {
    if (step.kind !== 'preview') return null
    const planned = planImport(step.sheet, { litersPerTank: Number(litersPerTank) || 5, unitPrice: variant?.price ?? null })
    return { ...planned, rows: withStockWarnings(planned.rows, variant?.available ?? null) }
  }, [step, litersPerTank, variant])
  const valid = plan?.rows.filter((row) => !row.error) ?? []

  // Con un file in anteprima si chiede conferma prima di uscire; durante l'invio non si esce.
  const dirty = step.kind === 'preview'
  const busy = step.kind === 'sending'
  useEffect(() => onStatus({ dirty, busy }), [dirty, busy, onStatus])

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setReadError(null)
    try {
      setStep({ kind: 'preview', sheet: await readFirstSheet(file), fileName: file.name })
    } catch (error) {
      setReadError(error instanceof Error ? error.message : 'Il file non si legge.')
    }
  }

  const send = async () => {
    if (step.kind !== 'preview' || valid.length === 0) return
    const names = new Map(valid.map((row) => [row.line, row.name]))
    const settings = { variantId, shippingOptionId: deliveryId === NONE ? null : deliveryId, agentId: agentId === NONE ? null : agentId, fileName: step.fileName }
    setStep({ kind: 'sending', done: 0, total: valid.length })
    try {
      const outcomes = await sendImport(valid, settings, (done) => setStep({ kind: 'sending', done, total: valid.length }))
      setStep({ kind: 'done', outcomes, names })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Importazione interrotta.')
      setStep({ kind: 'file' })
    } finally {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['vendite'] })
    }
  }

  if (step.kind === 'sending') {
    return (
      <Text aria-live="polite">
        Creo gli ordini: {step.done} di {step.total}…
      </Text>
    )
  }
  if (step.kind === 'done') return <ImportDone outcomes={step.outcomes} names={step.names} onClose={onClose} onAgain={() => setStep({ kind: 'file' })} />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <FormField id="import-variant" label="Prodotto" hint={variant?.price != null ? `Listino ${formatEuro(variant.price)} a tanica` : 'Senza prezzo di listino'}>
          <Select value={variantId} onValueChange={setVariantId}>
            <Select.Trigger id="import-variant">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {catalog.variants.map((item) => (
                <Select.Item key={item.variantId} value={item.variantId}>
                  {item.product}, {item.variant}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </FormField>
        <FormField id="import-liters" label="Litri per tanica">
          <Input id="import-liters" type="number" min={1} value={litersPerTank} onChange={(event) => setLitersPerTank(event.target.value)} />
        </FormField>
        <FormField id="import-delivery" label="Consegna">
          <Select value={deliveryId} onValueChange={setDeliveryId}>
            <Select.Trigger id="import-delivery">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={NONE}>Da definire (ritiro in sede)</Select.Item>
              {catalog.delivery_options.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </FormField>
        <FormField id="import-agent" label="Agente">
          <Select value={agentId} onValueChange={setAgentId}>
            <Select.Trigger id="import-agent">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={NONE}>Nessun agente</Select.Item>
              {(catalog.agents ?? []).map((agent) => (
                <Select.Item key={agent.id} value={agent.id}>
                  {agent.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="small" variant="secondary">
          <label className="cursor-pointer">
            {step.kind === 'preview' ? 'Scegli un altro file' : 'Scegli il file .xlsx'}
            <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={choose} />
          </label>
        </Button>
        {step.kind === 'preview' && (
          <Text size="small" className="text-ui-fg-subtle">
            {step.fileName}
          </Text>
        )}
      </div>
      {readError && (
        <Text size="small" className="text-ui-fg-error" role="alert">
          {readError}
        </Text>
      )}

      {plan?.error && (
        <Text size="small" className="text-ui-fg-error" role="alert">
          {plan.error} La prima riga del foglio deve avere le intestazioni: Nome, L, Taniche, Importo.
        </Text>
      )}
      {plan && !plan.error && <OrderImportPreview rows={plan.rows} />}

      {step.kind === 'preview' && (
        <div className="flex justify-end">
          <Button disabled={valid.length === 0 || !variantId} onClick={send}>
            {valid.length === 1 ? 'Importa 1 ordine' : `Importa ${valid.length} ordini`}
          </Button>
        </div>
      )}
    </div>
  )
}

type ImportDoneProps = { outcomes: ImportOutcome[]; names: Map<number, string>; onClose: () => void; onAgain: () => void }

function ImportDone({ outcomes, names, onClose, onAgain }: ImportDoneProps) {
  const ok = outcomes.filter((outcome) => outcome.ok).length
  const failed = outcomes.filter((outcome) => !outcome.ok)
  return (
    <div className="flex flex-col gap-4" role="status">
      <Heading level="h2">{ok === 1 ? 'Importato 1 ordine.' : `Importati ${ok} ordini.`}</Heading>
      {failed.length > 0 && (
        <div className="flex flex-col gap-2">
          <Text size="small" className="text-ui-fg-error">
            {failed.length === 1 ? 'Una riga non è stata importata:' : `${failed.length} righe non sono state importate:`}
          </Text>
          <ul className="flex flex-col gap-1">
            {failed.map((outcome) => (
              <li key={outcome.line}>
                <Text size="small">
                  Riga {outcome.line}, {names.get(outcome.line) ?? ''}: {outcome.error}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Text size="small" className="text-ui-fg-subtle">
        Gli ordini sono nell’elenco, con la nota “Importato da …” e gli incassi da registrare.
      </Text>
      <div className="flex gap-2">
        <Button onClick={onClose}>Chiudi</Button>
        <Button variant="secondary" onClick={onAgain}>
          Importa un altro file
        </Button>
      </div>
    </div>
  )
}
