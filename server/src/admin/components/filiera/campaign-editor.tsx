import { Button, Checkbox, Container, Heading, Input, Select, Text, Textarea } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { toDateInput, useFilieraAction, useRegistry, type Campaign } from '../../lib/filiera-api'
import { AnalysesPanel } from './analyses-panel'

const NONE = 'nessuno'

function SourcePicker({ campaign, selected, onToggle }: { campaign: Campaign; selected: string[]; onToggle: (id: string) => void }) {
  const kind = campaign.product_line === 'olio' ? 'groves' : 'apiaries'
  const registry = useRegistry(kind)
  const items = registry.data?.items ?? []
  return (
    <FormField id="sources" label={campaign.product_line === 'olio' ? 'Oliveti' : 'Apiari'}>
      {items.length === 0 && <Text size="small" className="text-ui-fg-subtle">Nessuno in anagrafica.</Text>}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 txt-compact-small">
            <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => onToggle(item.id)} />
            {item.name}, {item.municipality}
          </label>
        ))}
      </div>
    </FormField>
  )
}

/** Campagna: periodo, frantoio (olio), oliveti o apiari di provenienza, analisi dell'anno. */
export function CampaignEditor({ campaign }: { campaign: Campaign }) {
  const mills = useRegistry('mills')
  const action = useFilieraAction()
  const isOil = campaign.product_line === 'olio'
  const [form, setForm] = useState({
    label: campaign.label,
    harvest_start: toDateInput(campaign.harvest_start),
    harvest_end: toDateInput(campaign.harvest_end),
    mill_id: campaign.mill?.id ?? NONE,
    notes: campaign.notes ?? '',
  })
  const [sources, setSources] = useState<string[]>(
    (isOil ? campaign.groves : campaign.apiaries)?.map((item) => item.id) ?? [],
  )
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }))
  const toggle = (id: string) =>
    setSources((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate({
      path: `/admin/filiera/campaigns/${campaign.id}`,
      success: 'Campagna salvata.',
      body: {
        label: form.label.trim(),
        harvest_start: orNull(form.harvest_start),
        harvest_end: orNull(form.harvest_end),
        notes: orNull(form.notes),
        ...(isOil ? { mill_id: form.mill_id === NONE ? null : form.mill_id, grove_ids: sources } : { apiary_ids: sources }),
      },
    })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Campagna {campaign.label}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {(campaign.lots ?? []).length} lotti collegati.
          </Text>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-2">
          <FormField id="campaign-label" label="Nome" hint="Per esempio 2025/26.">
            <Input id="campaign-label" value={form.label} onChange={(e) => set('label')(e.target.value)} required />
          </FormField>
          {isOil && (
            <FormField id="campaign-mill" label="Frantoio della campagna">
              <Select value={form.mill_id} onValueChange={set('mill_id')}>
                <Select.Trigger id="campaign-mill">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value={NONE}>Non ancora scelto</Select.Item>
                  {(mills.data?.items ?? []).map((mill) => (
                    <Select.Item key={mill.id} value={mill.id}>
                      {mill.name}, {mill.municipality}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </FormField>
          )}
          <FormField id="campaign-start" label={isOil ? 'Inizio raccolta' : 'Inizio produzione'}>
            <Input id="campaign-start" type="date" value={form.harvest_start} onChange={(e) => set('harvest_start')(e.target.value)} />
          </FormField>
          <FormField id="campaign-end" label={isOil ? 'Fine raccolta' : 'Fine produzione'}>
            <Input id="campaign-end" type="date" value={form.harvest_end} onChange={(e) => set('harvest_end')(e.target.value)} />
          </FormField>
          <SourcePicker campaign={campaign} selected={sources} onToggle={toggle} />
          <FormField id="campaign-notes" label="Note interne">
            <Textarea id="campaign-notes" value={form.notes} onChange={(e) => set('notes')(e.target.value)} />
          </FormField>
          <div className="flex justify-end md:col-span-2">
            <Button size="small" type="submit" isLoading={action.isPending}>
              Salva la campagna
            </Button>
          </div>
        </form>
      </Container>
      <AnalysesPanel campaign={campaign} />
    </div>
  )
}
