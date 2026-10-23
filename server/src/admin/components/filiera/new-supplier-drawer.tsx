import { Button, Checkbox, Drawer, Input, Label, Text } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { useGuardedOpen } from '../use-guarded-open'
import { useFilieraAction, useSupplierTypes } from '../../lib/filiera-api'

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

/** Nuovo fornitore con le sue tipologie: servono nome e comune, il resto si completa quando c'è. */
export function NewSupplierDrawer() {
  const types = useSupplierTypes()
  const action = useFilieraAction()
  const [values, setValues] = useState<Record<string, string>>({})
  const [typeIds, setTypeIds] = useState<string[]>([])
  const { open, onOpenChange, close, contentProps } = useGuardedOpen({
    dirty: Object.values(values).some((value) => value.trim() !== '') || typeIds.length > 0,
    onDiscard: () => {
      setValues({})
      setTypeIds([])
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const body = Object.fromEntries(
      FIELDS.map((field) => [field.key, field.key === 'name' || field.key === 'municipality' ? (values[field.key] ?? '').trim() : orNull(values[field.key] ?? '')]),
    )
    action.mutate(
      { path: '/admin/filiera/registries/suppliers', body: { ...body, type_ids: typeIds }, success: 'Fornitore aggiunto.' },
      {
        onSuccess: close,
      },
    )
  }

  const toggle = (id: string, checked: boolean) =>
    setTypeIds((current) => (checked ? [...current, id] : current.filter((value) => value !== id)))

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <Button size="small">Nuovo fornitore</Button>
      </Drawer.Trigger>
      <Drawer.Content {...contentProps}>
        <form onSubmit={submit} className="flex h-full flex-col">
          <Drawer.Header>
            <Drawer.Title>Nuovo fornitore</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
            <fieldset className="flex flex-col gap-3">
              <legend className="txt-compact-small-plus mb-3">Tipologie</legend>
              <div className="grid grid-cols-2 gap-3">
                {(types.data?.types ?? []).map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <Checkbox id={`type-${type.id}`} checked={typeIds.includes(type.id)} onCheckedChange={(checked) => toggle(type.id, checked === true)} />
                    <Label htmlFor={`type-${type.id}`} size="small">
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-4">
              {FIELDS.map((field) => {
                const id = `supplier-${field.key}`
                return (
                  <FormField key={field.key} id={id} label={field.label} hint={field.internal ? 'Dato interno, mai pubblicato.' : field.hint}>
                    <Input id={id} value={values[field.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))} />
                  </FormField>
                )
              })}
            </div>
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
