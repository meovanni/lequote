import { Button, IconButton, Input, Select, Table, Text, usePrompt } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { useFilieraAction, useRegistry, type RegistryKind } from '../../lib/filiera-api'

type Field = {
  key: string
  label: string
  type?: 'text' | 'number' | 'list' | 'role'
  hint?: string
  internal?: boolean
}

const COMMON: Field[] = [
  { key: 'name', label: 'Nome' },
  { key: 'municipality', label: 'Comune' },
  { key: 'province', label: 'Provincia', hint: 'Sigla, per esempio TE.' },
]

// Campi per anagrafica: quelli "internal" non arrivano mai al pubblico (lib/public-lot.ts).
export const REGISTRY_FIELDS: Record<RegistryKind, Field[]> = {
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
  mills: [...COMMON, { key: 'address', label: 'Indirizzo' }, { key: 'vat_number', label: 'Partita IVA', internal: true }],
  establishments: [
    { key: 'name', label: 'Nome' },
    { key: 'role', label: 'Ruolo', type: 'role' },
    { key: 'municipality', label: 'Comune' },
    { key: 'province', label: 'Provincia', hint: 'Sigla, per esempio AQ.' },
    { key: 'address', label: 'Indirizzo' },
    { key: 'internal_code', label: 'Codice di registrazione', internal: true },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  imbottigliamento: 'Imbottigliamento',
  invasettamento: 'Invasettamento',
  laboratorio: 'Laboratorio aziendale',
}

function toPayload(fields: Field[], values: Record<string, string>) {
  return Object.fromEntries(
    fields.map((field) => {
      const raw = values[field.key] ?? ''
      if (field.type === 'number') return [field.key, raw.trim() === '' ? null : Number(raw)]
      if (field.type === 'list') return [field.key, raw.split(',').map((item) => item.trim()).filter(Boolean)]
      if (field.key === 'name' || field.key === 'municipality' || field.type === 'role') return [field.key, raw.trim()]
      return [field.key, orNull(raw)]
    }),
  )
}

export function RegistryPanel({ kind }: { kind: RegistryKind }) {
  const registry = useRegistry(kind)
  const action = useFilieraAction()
  const prompt = usePrompt()
  const fields = REGISTRY_FIELDS[kind]
  const [values, setValues] = useState<Record<string, string>>({ role: 'imbottigliamento' })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: `/admin/filiera/registries/${kind}`, body: toPayload(fields, values), success: 'Aggiunto in anagrafica.' },
      { onSuccess: () => setValues({ role: 'imbottigliamento' }) },
    )
  }

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

  return (
    <div className="flex flex-col divide-y">
      {items.length === 0 && <Text className="px-6 py-6 text-ui-fg-subtle">Ancora vuota.</Text>}
      {items.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Comune</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>
                  {item.municipality}
                  {item.province ? ` (${item.province})` : ''}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <IconButton size="small" variant="transparent" aria-label={`Elimina ${item.name}`} onClick={() => remove(item.id, item.name)}>
                    <Trash />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-3">
        {fields.map((field) => {
          const id = `${kind}-${field.key}`
          const hint = field.internal ? 'Dato interno, mai pubblicato.' : field.hint
          return (
            <FormField key={field.key} id={id} label={field.label} hint={hint}>
              {field.type === 'role' ? (
                <Select value={values.role} onValueChange={(value) => setValues((v) => ({ ...v, role: value }))}>
                  <Select.Trigger id={id}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {Object.entries(ROLE_LABEL).map(([value, label]) => (
                      <Select.Item key={value} value={value}>
                        {label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              ) : (
                <Input
                  id={id}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                />
              )}
            </FormField>
          )
        })}
        <div className="flex items-end justify-end md:col-span-3">
          <Button
            size="small"
            type="submit"
            isLoading={action.isPending}
            disabled={!values.name?.trim() || !values.municipality?.trim()}
          >
            Aggiungi
          </Button>
        </div>
      </form>
    </div>
  )
}
