import { Button, Input, RadioGroup, Label, Select, Text, Textarea } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { formatEuro, type Catalog } from '../../lib/sales-api'

const NONE = 'nessuno'

type Customer = Record<
  'first_name' | 'last_name' | 'company' | 'vat_number' | 'fiscal_code' | 'email' | 'phone' | 'address_1' | 'postal_code' | 'city' | 'province',
  string
>

const EMPTY: Customer = {
  first_name: '',
  last_name: '',
  company: '',
  vat_number: '',
  fiscal_code: '',
  email: '',
  phone: '',
  address_1: '',
  postal_code: '',
  city: '',
  province: '',
}

type BookingFormProps = {
  catalog: Catalog
  /** Solo nel back office: a quale agente attribuire la vendita. */
  showAgent?: boolean
  submitting: boolean
  submitLabel: string
  onSubmit: (body: Record<string, unknown>) => void
}

/**
 * Cliente (privato o azienda), prodotti, consegna e note di un nuovo ordine o prenotazione.
 * Bastano il nome o il cognome del cliente e un prodotto: il resto è facoltativo.
 */
export function BookingForm({ catalog, showAgent = false, submitting, submitLabel, onSubmit }: BookingFormProps) {
  const [kind, setKind] = useState<'privato' | 'azienda'>('privato')
  const [customer, setCustomer] = useState<Customer>(EMPTY)
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [deliveryId, setDeliveryId] = useState(NONE)
  const [agentId, setAgentId] = useState(NONE)
  const [notes, setNotes] = useState('')

  const set = (key: keyof Customer) => (value: string) => setCustomer((current) => ({ ...current, [key]: value }))
  const lines = catalog.variants
    .map((variant) => ({ variant, quantity: Number(quantities[variant.variantId] || 0) }))
    .filter((line) => line.quantity > 0)
  const estimate = lines.reduce((sum, line) => sum + (line.variant.price ?? 0) * line.quantity, 0)
  const business = kind === 'azienda'
  const ready = Boolean(customer.first_name.trim() || customer.last_name.trim()) && lines.length > 0

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      customer: {
        kind,
        first_name: orNull(customer.first_name),
        last_name: orNull(customer.last_name),
        phone: orNull(customer.phone),
        company: business ? orNull(customer.company) : null,
        vat_number: business ? orNull(customer.vat_number) : null,
        fiscal_code: orNull(customer.fiscal_code),
        email: orNull(customer.email),
        address_1: orNull(customer.address_1),
        postal_code: orNull(customer.postal_code),
        city: orNull(customer.city),
        province: orNull(customer.province),
      },
      items: lines.map((line) => ({ variant_id: line.variant.variantId, quantity: line.quantity })),
      ...(deliveryId !== NONE ? { shipping_option_id: deliveryId } : {}),
      notes: orNull(notes),
      ...(showAgent && agentId !== NONE ? { agent_id: agentId } : {}),
    })
  }

  const input = (key: keyof Customer, label: string, hint?: string) => (
    <FormField id={`booking-${key}`} label={label} hint={hint}>
      <Input id={`booking-${key}`} value={customer[key]} onChange={(event) => set(key)(event.target.value)} />
    </FormField>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Text size="small" className="text-ui-fg-subtle">
        Bastano il nome o il cognome del cliente e almeno un prodotto: il resto si può aggiungere dopo.
      </Text>
      <section className="flex flex-col gap-4">
        <RadioGroup value={kind} onValueChange={(value) => setKind(value as 'privato' | 'azienda')} className="flex gap-6">
          <div className="flex items-center gap-2">
            <RadioGroup.Item value="privato" id="booking-kind-privato" />
            <Label htmlFor="booking-kind-privato">Privato</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroup.Item value="azienda" id="booking-kind-azienda" />
            <Label htmlFor="booking-kind-azienda">Azienda (negozio, ristorante…)</Label>
          </div>
        </RadioGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {business && input('company', 'Ragione sociale')}
          {business && input('vat_number', 'Partita IVA', '11 cifre.')}
          {input('first_name', business ? 'Nome del referente' : 'Nome')}
          {input('last_name', business ? 'Cognome del referente' : 'Cognome')}
          {input('phone', 'Telefono')}
          {input('email', 'Email', 'Facoltativa: se c’è, il cliente riceve la conferma.')}
          {input('fiscal_code', 'Codice fiscale', 'Facoltativo.')}
          {input('address_1', 'Indirizzo')}
          {input('postal_code', 'CAP')}
          {input('city', 'Comune')}
          {input('province', 'Provincia', 'Sigla, per esempio TE.')}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Text size="small" weight="plus">
          Prodotti
        </Text>
        {catalog.variants.map((variant) => (
          <div key={variant.variantId} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
            <div>
              <Text size="small">
                {variant.product}, {variant.variant}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {variant.price === null ? 'Prezzo non impostato' : formatEuro(variant.price)}
                {variant.stock === null ? '' : ` · disponibili ${variant.stock}`}
              </Text>
            </div>
            <Input
              aria-label={`Quantità di ${variant.product}, ${variant.variant}`}
              type="number"
              min={0}
              max={variant.stock ?? undefined}
              className="w-24"
              value={quantities[variant.variantId] ?? ''}
              onChange={(event) => setQuantities((current) => ({ ...current, [variant.variantId]: event.target.value }))}
              disabled={variant.price === null}
            />
            <Text size="small" className="w-24 text-right">
              {Number(quantities[variant.variantId] || 0) > 0 && variant.price !== null
                ? formatEuro(variant.price * Number(quantities[variant.variantId]))
                : ''}
            </Text>
          </div>
        ))}
        <Text size="small" weight="plus" className="text-right">
          Totale indicativo, IVA inclusa: {formatEuro(estimate)}
        </Text>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField id="booking-delivery" label="Consegna">
          <Select value={deliveryId} onValueChange={setDeliveryId}>
            <Select.Trigger id="booking-delivery">
              <Select.Value placeholder="Scegli" />
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
        {showAgent && (
          <FormField id="booking-agent" label="Agente" hint="Facoltativo: la vendita entra nei suoi riepiloghi.">
            <Select value={agentId} onValueChange={setAgentId}>
              <Select.Trigger id="booking-agent">
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
        )}
        <div className="md:col-span-2">
          <FormField id="booking-notes" label="Note">
            <Textarea id="booking-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" isLoading={submitting} disabled={!ready}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
