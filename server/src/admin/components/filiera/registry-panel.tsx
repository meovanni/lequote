import { Button, Drawer, IconButton, Input, Table, Text, usePrompt } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { useFilieraAction, useRegistry, type RegistryItem, type RegistryKind } from '../../lib/filiera-api'

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
// I fornitori hanno una pagina loro (routes/fornitori).
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

export const NEW_LABEL: Record<PlaceKind, string> = { groves: 'Nuovo oliveto', apiaries: 'Nuovo apiario' }

function toPayload(fields: Field[], values: Record<string, string>) {
  return Object.fromEntries(
    fields.map((field) => {
      const raw = values[field.key] ?? ''
      if (field.type === 'number') return [field.key, raw.trim() === '' ? null : Number(raw)]
      if (field.type === 'list') return [field.key, raw.split(',').map((item) => item.trim()).filter(Boolean)]
      if (field.key === 'name' || field.key === 'municipality') return [field.key, raw.trim()]
      return [field.key, orNull(raw)]
    }),
  )
}

/** Riepilogo dei dati descrittivi di una voce, per la tabella. */
function details(kind: PlaceKind, item: RegistryItem): string {
  const parts: string[] = []
  if (typeof item.elevation_m === 'number') parts.push(`${item.elevation_m} m`)
  if (kind === 'groves' && typeof item.area_ha === 'number') parts.push(`${item.area_ha} ha`)
  if (kind === 'groves' && Array.isArray(item.cultivars) && item.cultivars.length > 0) parts.push(item.cultivars.join(', '))
  if (kind === 'apiaries' && typeof item.hive_count === 'number') parts.push(`${item.hive_count} alveari`)
  return parts.join('; ')
}

/** Elenco di oliveti o apiari. La nuova voce si crea dal pannello laterale (RegistryDrawer). */
export function RegistryPanel({ kind }: { kind: PlaceKind }) {
  const registry = useRegistry(kind)
  const action = useFilieraAction()
  const prompt = usePrompt()

  const remove = async (id: string, name: string) => {
    const confirmed = await prompt({
      title: `Eliminare ${name}?`,
      description: 'Le campagne e i lotti che lo usano perderanno il collegamento.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/registries/${kind}/${id}`, method: 'DELETE', success: 'Eliminato.' })
  }

  const items = registry.data?.items ?? []

  if (registry.isLoading) return <div className="m-6 h-24 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  if (items.length === 0) {
    return (
      <Text size="small" className="px-6 py-10 text-center text-ui-fg-subtle">
        Ancora vuota. Aggiungi la prima voce con “{NEW_LABEL[kind]}”.
      </Text>
    )
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Nome</Table.HeaderCell>
          <Table.HeaderCell>Comune</Table.HeaderCell>
          <Table.HeaderCell>Dettagli</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell className="txt-compact-small-plus">{item.name}</Table.Cell>
            <Table.Cell>
              {item.municipality}
              {item.province ? ` (${item.province})` : ''}
            </Table.Cell>
            <Table.Cell className="text-ui-fg-subtle">{details(kind, item) || '-'}</Table.Cell>
            <Table.Cell className="text-right">
              <IconButton size="small" variant="transparent" aria-label={`Elimina ${item.name}`} onClick={() => remove(item.id, item.name)}>
                <Trash />
              </IconButton>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

/** Nuovo oliveto o apiario: servono nome e comune, il resto si completa quando c'è. */
export function RegistryDrawer({ kind }: { kind: PlaceKind }) {
  const action = useFilieraAction()
  const fields = REGISTRY_FIELDS[kind]
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: `/admin/filiera/registries/${kind}`, body: toPayload(fields, values), success: 'Aggiunto in anagrafica.' },
      {
        onSuccess: () => {
          setValues({})
          setOpen(false)
        },
      },
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button size="small">{NEW_LABEL[kind]}</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <form onSubmit={submit} className="flex h-full flex-col">
          <Drawer.Header>
            <Drawer.Title>{NEW_LABEL[kind]}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
            {fields.map((field) => {
              const id = `${kind}-${field.key}`
              const hint = field.internal ? 'Dato interno, mai pubblicato.' : field.hint
              return (
                <FormField key={field.key} id={id} label={field.label} hint={hint}>
                  <Input
                    id={id}
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                </FormField>
              )
            })}
          </Drawer.Body>
          <Drawer.Footer>
            <Text size="xsmall" className="mr-auto text-ui-fg-muted">
              Servono nome e comune.
            </Text>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Annulla
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={action.isPending} disabled={!values.name?.trim() || !values.municipality?.trim()}>
              Aggiungi
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
