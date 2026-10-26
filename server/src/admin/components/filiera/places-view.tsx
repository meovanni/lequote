import { Trash } from '@medusajs/icons'
import { Badge, Button, Heading, IconButton, Input, Text, usePrompt } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { LINE_LABEL, useFilieraAction, useRegistry, useStageTemplates, type RegistryItem, type RegistryKind } from '../../lib/filiera-api'
import { InlineText } from '../inline/inline-fields'

// Oliveti e apiari nella stessa vista, ciascuno in una tabella con le celle modificabili sul posto
// e una riga per aggiungerne uno nuovo. Sotto, i modelli di fase (sola lettura).

type Field = {
  key: string
  label: string
  type?: 'text' | 'number' | 'list'
  hint?: string
  internal?: boolean
}

const COMMON: Field[] = [
  { key: 'name', label: 'Nome' },
  { key: 'municipality', label: 'Comune' },
  { key: 'province', label: 'Provincia', hint: 'Sigla, per esempio TE.' },
]

export type PlaceKind = Exclude<RegistryKind, 'suppliers'>

// Campi per anagrafica: quelli "internal" non arrivano mai al pubblico (lib/public-lot.ts).
export const REGISTRY_FIELDS: Record<PlaceKind, Field[]> = {
  groves: [
    ...COMMON,
    { key: 'elevation_m', label: 'Altitudine (m)', type: 'number' },
    { key: 'area_ha', label: 'Superficie (ha)', type: 'number' },
    { key: 'cultivars', label: 'Varietà', type: 'list', hint: 'Separate da virgola.' },
    { key: 'sian_code', label: 'Codice SIAN', internal: true },
  ],
  apiaries: [
    ...COMMON,
    { key: 'elevation_m', label: 'Altitudine (m)', type: 'number' },
    { key: 'hive_count', label: 'Numero di alveari', type: 'number' },
    { key: 'bda_code', label: 'Codice BDA', internal: true },
  ],
}

const TITLE: Record<PlaceKind, string> = { groves: 'Oliveti', apiaries: 'Apiari' }

const show = (value: unknown) => (Array.isArray(value) ? value.join(', ') : value === null || value === undefined ? '' : String(value))

function toValue(type: string | undefined, text: string | null): unknown {
  if (type === 'number') return text === null ? null : Number(text.replace(',', '.'))
  if (type === 'list') return (text ?? '').split(',').map((item) => item.trim()).filter(Boolean)
  return text
}

function PlaceTable({ kind }: { kind: PlaceKind }) {
  const registry = useRegistry(kind)
  const action = useFilieraAction()
  const prompt = usePrompt()
  const fields = REGISTRY_FIELDS[kind]
  const [name, setName] = useState('')
  const [municipality, setMunicipality] = useState('')
  const items = registry.data?.items ?? []

  const save = (item: RegistryItem, key: string, value: unknown) =>
    action.mutate({ path: `/admin/filiera/registries/${kind}/${item.id}`, body: { [key]: value }, success: 'Salvato.' })
  const remove = async (item: RegistryItem) => {
    const confirmed = await prompt({
      title: `Eliminare ${item.name}?`,
      description: 'Le campagne che lo usano perderanno il collegamento.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/registries/${kind}/${item.id}`, method: 'DELETE', success: 'Eliminato.' })
  }
  const create = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: `/admin/filiera/registries/${kind}`, body: { name: name.trim(), municipality: municipality.trim() }, success: 'Aggiunto: completa i dati nella riga.' },
      { onSuccess: () => { setName(''); setMunicipality('') } },
    )
  }

  return (
    <section className="flex flex-col gap-2">
      <Heading level="h2" className="px-6">{TITLE[kind]}</Heading>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="txt-compact-xsmall-plus border-t border-ui-border-base text-ui-fg-muted">
              {fields.map((field) => (
                <th key={field.key} className="px-2 py-2 text-left font-normal first:pl-6">
                  {field.label}
                  {field.internal && <span className="text-ui-fg-muted"> (interno)</span>}
                </th>
              ))}
              <th className="px-6 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-ui-border-base">
                {fields.map((field) => (
                  <td key={field.key} className="px-1 py-1 first:pl-4">
                    <InlineText
                      value={show(item[field.key])}
                      label={`${field.label} di ${item.name}`}
                      required={field.key === 'name' || field.key === 'municipality'}
                      className={field.key === 'name' ? 'min-w-[13rem]' : undefined}
                      onSave={(text) => save(item, field.key, toValue(field.type, text))}
                    />
                  </td>
                ))}
                <td className="px-6 py-1 text-right">
                  <IconButton size="small" variant="transparent" aria-label={`Elimina ${item.name}`} onClick={() => void remove(item)}>
                    <Trash />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={create} className="flex flex-wrap items-center gap-2 px-6">
        <Input size="small" aria-label="Nome" placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} className="w-52" />
        <Input size="small" aria-label="Comune" placeholder="Comune" value={municipality} onChange={(event) => setMunicipality(event.target.value)} className="w-44" />
        <Button size="small" variant="secondary" type="submit" disabled={!name.trim() || !municipality.trim()} isLoading={action.isPending}>
          Aggiungi
        </Button>
      </form>
    </section>
  )
}

function StageTemplates() {
  const { data } = useStageTemplates()
  return (
    <section className="flex flex-col gap-2 px-6">
      <Heading level="h2">Fasi di filiera</Heading>
      <Text size="small" className="text-ui-fg-subtle">Le fasi che si aggiungono ai lotti, con i dati che chiedono.</Text>
      <ul className="flex flex-col gap-1">
        {(data?.templates ?? []).map((template) => (
          <li key={template.id} className="flex flex-wrap items-center gap-2">
            <Text size="small" className="w-56">
              {LINE_LABEL[template.product_line]} · {template.position}. {template.name}
            </Text>
            {template.fields.length === 0 && <Text size="small" className="text-ui-fg-muted">solo data e luogo</Text>}
            {template.fields.map((field) => (
              <Badge key={field.key} size="2xsmall">{field.label}</Badge>
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PlacesView() {
  return (
    <div className="flex flex-col gap-8 pb-6">
      <PlaceTable kind="groves" />
      <PlaceTable kind="apiaries" />
      <StageTemplates />
    </div>
  )
}
