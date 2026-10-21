import { Badge, Button, Checkbox, IconButton, Input, Label, Table, Text, usePrompt } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { useFilieraAction, useSupplierTypes, useSuppliers } from '../../lib/filiera-api'

const FIELDS: { key: string; label: string; hint?: string; internal?: boolean }[] = [
  { key: 'name', label: 'Nome' },
  { key: 'municipality', label: 'Comune' },
  { key: 'province', label: 'Provincia', hint: 'Sigla, per esempio TE.' },
  { key: 'address', label: 'Indirizzo' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefono' },
  { key: 'vat_number', label: 'Partita IVA', internal: true },
  { key: 'internal_code', label: 'Codice di registrazione', hint: 'Per esempio il codice SIAN dello stabilimento.', internal: true },
]

/** Fornitori: frantoi, stabilimenti di confezionamento, laboratori, packaging e tipologie nuove. */
export function SupplierPanel() {
  const suppliers = useSuppliers()
  const types = useSupplierTypes()
  const action = useFilieraAction()
  const prompt = usePrompt()
  const [values, setValues] = useState<Record<string, string>>({})
  const [typeIds, setTypeIds] = useState<string[]>([])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const body = Object.fromEntries(
      FIELDS.map((field) => [field.key, field.key === 'name' || field.key === 'municipality' ? (values[field.key] ?? '').trim() : orNull(values[field.key] ?? '')]),
    )
    action.mutate(
      { path: '/admin/filiera/registries/suppliers', body: { ...body, type_ids: typeIds }, success: 'Fornitore aggiunto.' },
      {
        onSuccess: () => {
          setValues({})
          setTypeIds([])
        },
      },
    )
  }

  const remove = async (id: string, name: string) => {
    const confirmed = await prompt({
      title: `Eliminare ${name}?`,
      description: 'Si può eliminare solo un fornitore che nessuna campagna e nessun lotto usa.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/registries/suppliers/${id}`, method: 'DELETE', success: 'Fornitore eliminato.' })
  }

  const toggle = (id: string, checked: boolean) =>
    setTypeIds((current) => (checked ? [...current, id] : current.filter((value) => value !== id)))

  const items = suppliers.data?.items ?? []

  return (
    <div className="flex flex-col divide-y">
      {items.length === 0 && <Text className="px-6 py-6 text-ui-fg-subtle">Nessun fornitore. Aggiungi il primo qui sotto.</Text>}
      {items.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Tipologie</Table.HeaderCell>
              <Table.HeaderCell>Comune</Table.HeaderCell>
              <Table.HeaderCell>Contatti</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {(item.types ?? []).map((type) => (
                      <Badge key={type.id} size="2xsmall">
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {item.municipality}
                  {item.province ? ` (${item.province})` : ''}
                </Table.Cell>
                <Table.Cell>{[item.email, item.phone].filter(Boolean).join(', ')}</Table.Cell>
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

      <form onSubmit={submit} className="flex flex-col gap-4 px-6 py-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FIELDS.map((field) => {
            const id = `supplier-${field.key}`
            return (
              <FormField key={field.key} id={id} label={field.label} hint={field.internal ? 'Dato interno, mai pubblicato.' : field.hint}>
                <Input id={id} value={values[field.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))} />
              </FormField>
            )
          })}
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="txt-compact-small-plus mb-2">Tipologie</legend>
          <div className="flex flex-wrap gap-4">
            {(types.data?.types ?? []).map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <Checkbox id={`type-${type.id}`} checked={typeIds.includes(type.id)} onCheckedChange={(checked) => toggle(type.id, checked === true)} />
                <Label htmlFor={`type-${type.id}`}>{type.name}</Label>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end">
          <Button size="small" type="submit" isLoading={action.isPending} disabled={!values.name?.trim() || !values.municipality?.trim()}>
            Aggiungi fornitore
          </Button>
        </div>
      </form>
    </div>
  )
}

/** Tipologie di fornitore: quelle di sistema si usano nei menu di campagne e lotti e non si eliminano. */
export function SupplierTypesPanel() {
  const types = useSupplierTypes()
  const action = useFilieraAction()
  const [name, setName] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      { path: '/admin/filiera/supplier-types', body: { name: name.trim() }, success: 'Tipologia creata.' },
      { onSuccess: () => setName('') },
    )
  }

  return (
    <div className="flex flex-col divide-y">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Tipologia</Table.HeaderCell>
            <Table.HeaderCell>Uso</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(types.data?.types ?? []).map((type) => (
            <Table.Row key={type.id}>
              <Table.Cell>{type.name}</Table.Cell>
              <Table.Cell>
                {type.code ? (
                  <Text size="small" className="text-ui-fg-subtle">
                    Di sistema
                  </Text>
                ) : null}
              </Table.Cell>
              <Table.Cell className="text-right">
                {!type.code && (
                  <IconButton
                    size="small"
                    variant="transparent"
                    aria-label={`Elimina ${type.name}`}
                    onClick={() => action.mutate({ path: `/admin/filiera/supplier-types/${type.id}`, method: 'DELETE', success: 'Tipologia eliminata.' })}
                  >
                    <Trash />
                  </IconButton>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <form onSubmit={submit} className="flex items-end gap-3 px-6 py-4">
        <FormField id="new-supplier-type" label="Nuova tipologia" hint="Per esempio Vetreria, Tipografia, Trasporti.">
          <Input id="new-supplier-type" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <Button size="small" type="submit" isLoading={action.isPending} disabled={!name.trim()}>
          Crea
        </Button>
      </form>
    </div>
  )
}
