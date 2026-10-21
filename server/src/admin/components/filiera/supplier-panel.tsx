import { Badge, Button, IconButton, Input, Table, Text, usePrompt } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState, type FormEvent } from 'react'
import { FormField } from '../form-field'
import { useFilieraAction, useSupplierTypes, useSuppliers } from '../../lib/filiera-api'

/** Elenco dei fornitori, filtrabile per tipologia. Il nuovo fornitore si crea dal pannello laterale. */
export function SupplierPanel() {
  const suppliers = useSuppliers()
  const types = useSupplierTypes()
  const action = useFilieraAction()
  const prompt = usePrompt()
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const remove = async (id: string, name: string) => {
    const confirmed = await prompt({
      title: `Eliminare ${name}?`,
      description: 'Si può eliminare solo un fornitore che nessuna campagna e nessun lotto usa.',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    })
    if (confirmed) action.mutate({ path: `/admin/filiera/registries/suppliers/${id}`, method: 'DELETE', success: 'Fornitore eliminato.' })
  }

  const all = suppliers.data?.items ?? []
  const items = typeFilter ? all.filter((item) => (item.types ?? []).some((type) => type.id === typeFilter)) : all
  const usedTypes = (types.data?.types ?? []).filter((type) => all.some((item) => (item.types ?? []).some((t) => t.id === type.id)))

  if (suppliers.isLoading) return <div className="m-6 h-32 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
  if (all.length === 0) {
    return (
      <Text size="small" className="px-6 py-10 text-center text-ui-fg-subtle">
        Nessun fornitore. Aggiungi il primo con “Nuovo fornitore”.
      </Text>
    )
  }

  return (
    <div className="flex flex-col">
      {usedTypes.length > 1 && (
        <div role="group" aria-label="Filtra per tipologia" className="flex flex-wrap gap-2 px-6 py-3">
          {[{ id: null, name: 'Tutte' }, ...usedTypes].map((type) => (
            <Button
              key={type.id ?? 'all'}
              type="button"
              size="small"
              variant={typeFilter === type.id ? 'secondary' : 'transparent'}
              aria-pressed={typeFilter === type.id}
              onClick={() => setTypeFilter(type.id)}
            >
              {type.name}
            </Button>
          ))}
        </div>
      )}
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
              <Table.Cell className="txt-compact-small-plus">{item.name}</Table.Cell>
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
              <Table.Cell className="text-ui-fg-subtle">{[item.email, item.phone].filter(Boolean).join(', ') || '-'}</Table.Cell>
              <Table.Cell className="text-right">
                <IconButton size="small" variant="transparent" aria-label={`Elimina ${item.name}`} onClick={() => remove(item.id, item.name)}>
                  <Trash />
                </IconButton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
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
