import { Button, Container, Heading, Input, Select, Text, Textarea } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { toDateInput, useFilieraAction, useRegistry, type Lot } from '../../lib/filiera-api'

const NONE = 'nessuno'

/** Dati obbligatori di etichetta (Reg. UE 1169/2011 art. 9) e dati di produzione del lotto. */
export function LotLabelForm({ lot }: { lot: Lot }) {
  const establishments = useRegistry('establishments')
  const action = useFilieraAction()
  const [form, setForm] = useState({
    product_name: lot.product_name,
    nominal_quantity: lot.nominal_quantity ?? '',
    origin: lot.origin,
    packaging_date: toDateInput(lot.packaging_date),
    best_before: toDateInput(lot.best_before),
    packaging_establishment_id: lot.packaging_establishment_id ?? NONE,
    units: lot.units === null ? '' : String(lot.units),
    notes: lot.notes ?? '',
  })
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate({
      path: `/admin/filiera/lots/${lot.id}`,
      success: 'Dati del lotto salvati.',
      body: {
        product_name: form.product_name.trim(),
        nominal_quantity: orNull(form.nominal_quantity),
        origin: form.origin.trim() || 'Italia',
        packaging_date: orNull(form.packaging_date),
        best_before: orNull(form.best_before),
        packaging_establishment_id: form.packaging_establishment_id === NONE ? null : form.packaging_establishment_id,
        units: form.units.trim() === '' ? null : Number(form.units),
        notes: orNull(form.notes),
      },
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Dati di etichetta</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Finiscono nel pannello «Informazioni di legge» della pagina del lotto e sull'etichetta.
        </Text>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-2">
        <FormField id="product_name" label="Denominazione di vendita">
          <Input id="product_name" value={form.product_name} onChange={(e) => set('product_name')(e.target.value)} required />
        </FormField>
        <FormField id="nominal_quantity" label="Quantità nominale" hint="Per esempio 0,75 l oppure 500 g.">
          <Input id="nominal_quantity" value={form.nominal_quantity} onChange={(e) => set('nominal_quantity')(e.target.value)} />
        </FormField>
        <FormField id="origin" label="Origine">
          <Input id="origin" value={form.origin} onChange={(e) => set('origin')(e.target.value)} />
        </FormField>
        <FormField id="best_before" label="Da consumarsi preferibilmente entro">
          <Input id="best_before" type="date" value={form.best_before} onChange={(e) => set('best_before')(e.target.value)} />
        </FormField>
        <FormField id="packaging_date" label="Data di confezionamento">
          <Input id="packaging_date" type="date" value={form.packaging_date} onChange={(e) => set('packaging_date')(e.target.value)} />
        </FormField>
        <FormField id="establishment" label="Stabilimento di confezionamento">
          <Select value={form.packaging_establishment_id} onValueChange={set('packaging_establishment_id')}>
            <Select.Trigger id="establishment">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={NONE}>Non indicato</Select.Item>
              {(establishments.data?.items ?? []).map((item) => (
                <Select.Item key={item.id} value={item.id}>
                  {item.name}, {item.municipality}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </FormField>
        <FormField id="units" label="Pezzi prodotti" hint="Dato interno, non pubblicato.">
          <Input id="units" type="number" min={0} value={form.units} onChange={(e) => set('units')(e.target.value)} />
        </FormField>
        <FormField id="notes" label="Note interne">
          <Textarea id="notes" value={form.notes} onChange={(e) => set('notes')(e.target.value)} />
        </FormField>
        <div className="flex justify-end md:col-span-2">
          <Button size="small" type="submit" isLoading={action.isPending}>
            Salva i dati
          </Button>
        </div>
      </form>
    </Container>
  )
}
