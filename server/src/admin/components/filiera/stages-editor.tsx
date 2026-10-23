import { Badge, Button, Container, Heading, IconButton, Input, Select, Text } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState } from 'react'
import { FormField, orNull } from '../form-field'
import { toDateInput, useFilieraAction, useStageTemplates, type Lot, type LotStage, type Visibility } from '../../lib/filiera-api'
import { useUnsavedChanges } from '../../lib/unsaved-changes'

const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: 'Pubblico',
  legal: 'Informazioni di legge',
  internal: 'Interno',
}

type Draft = LotStage & { draftId: string }

const draftId = () => crypto.randomUUID()

function fromLot(lot: Lot): Draft[] {
  return [...(lot.stages ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((stage) => ({ ...stage, date: toDateInput(stage.date), draftId: draftId() }))
}

/** Le fasi ridotte ai dati che si salvano: vuoto e "non indicato" contano uguale. */
const comparable = (stages: LotStage[]) =>
  JSON.stringify(
    stages.map((stage) => [stage.template_id, stage.date || '', stage.place || '', stage.fields.map((field) => [field.key, field.value ?? ''])]),
  )

/** Fasi del lotto: si aggiungono dai modelli della linea e si compilano i loro campi. */
export function StagesEditor({ lot }: { lot: Lot }) {
  const templates = useStageTemplates(lot.product_line)
  const action = useFilieraAction()
  const [stages, setStages] = useState<Draft[]>(() => fromLot(lot))
  const [templateId, setTemplateId] = useState('')
  useUnsavedChanges(comparable(stages) !== comparable(fromLot(lot)))

  const update = (id: string, change: Partial<Draft>) =>
    setStages((current) => current.map((stage) => (stage.draftId === id ? { ...stage, ...change } : stage)))

  const updateField = (id: string, key: string, value: string) =>
    setStages((current) =>
      current.map((stage) =>
        stage.draftId === id
          ? { ...stage, fields: stage.fields.map((field) => (field.key === key ? { ...field, value } : field)) }
          : stage,
      ),
    )

  const addFromTemplate = () => {
    const template = templates.data?.templates.find((item) => item.id === templateId)
    if (!template) return
    const stage: Draft = {
      draftId: draftId(),
      template_id: template.id,
      name: template.name,
      position: template.position,
      date: '',
      place: '',
      fields: template.fields.map(({ key, label, visibility, required }) => ({ key, label, visibility, required, value: null })),
    }
    setStages((current) => [...current, stage].sort((a, b) => a.position - b.position))
    setTemplateId('')
  }

  const save = () =>
    action.mutate({
      path: `/admin/filiera/lots/${lot.id}/stages`,
      success: 'Fasi salvate.',
      body: {
        // Solo i valori: etichette, visibilità e obbligatorietà le rimette il server dal modello.
        stages: stages
          .filter((stage) => stage.template_id)
          .map(({ template_id, date, place, fields }) => ({
            template_id,
            date: orNull(date ?? ''),
            place: orNull(place ?? ''),
            values: Object.fromEntries(fields.map((field) => [field.key, field.value === '' ? null : field.value])),
          })),
      },
    })

  const available = (templates.data?.templates ?? []).filter((template) => template.active)

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h2">Fasi di filiera</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            I campi «Pubblico» compaiono nel percorso, quelli «Interno» restano qui.
          </Text>
        </div>
        <div className="flex gap-2">
          <Select size="small" value={templateId} onValueChange={setTemplateId}>
            <Select.Trigger className="w-52">
              <Select.Value placeholder="Aggiungi una fase" />
            </Select.Trigger>
            <Select.Content>
              {available.map((template) => (
                <Select.Item key={template.id} value={template.id}>
                  {template.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button size="small" variant="secondary" onClick={addFromTemplate} disabled={!templateId}>
            Aggiungi
          </Button>
        </div>
      </div>

      {stages.length === 0 && <Text className="px-6 py-6 text-ui-fg-subtle">Nessuna fase. Aggiungine una dai modelli.</Text>}

      {stages.map((stage) => (
        <div key={stage.draftId} className="flex flex-col gap-4 px-6 py-4">
          <div className="flex items-center justify-between">
            <Heading level="h3">{stage.name}</Heading>
            <IconButton
              size="small"
              variant="transparent"
              aria-label={`Rimuovi la fase ${stage.name}`}
              onClick={() => setStages((current) => current.filter((item) => item.draftId !== stage.draftId))}
            >
              <Trash />
            </IconButton>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField id={`${stage.draftId}-date`} label="Data">
              <Input id={`${stage.draftId}-date`} type="date" value={stage.date ?? ''} onChange={(e) => update(stage.draftId, { date: e.target.value })} />
            </FormField>
            <FormField id={`${stage.draftId}-place`} label="Luogo">
              <Input id={`${stage.draftId}-place`} value={stage.place ?? ''} onChange={(e) => update(stage.draftId, { place: e.target.value })} />
            </FormField>
            {stage.fields.map((field) => (
              <FormField key={field.key} id={`${stage.draftId}-${field.key}`} label={`${field.label}${field.required ? ' *' : ''}`}>
                <div className="flex items-center gap-2">
                  <Input
                    id={`${stage.draftId}-${field.key}`}
                    value={field.value === null ? '' : String(field.value)}
                    onChange={(e) => updateField(stage.draftId, field.key, e.target.value)}
                  />
                  <Badge size="2xsmall" color={field.visibility === 'internal' ? 'grey' : 'blue'}>
                    {VISIBILITY_LABEL[field.visibility]}
                  </Badge>
                </div>
              </FormField>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end px-6 py-4">
        <Button size="small" onClick={save} isLoading={action.isPending}>
          Salva le fasi
        </Button>
      </div>
    </Container>
  )
}
