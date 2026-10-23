import { ChevronDownMini } from '@medusajs/icons'
import { Button, clx, Heading, Input, Label, RadioGroup, Select, Text, Textarea } from '@medusajs/ui'
import { useEffect, useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { ProductPicker } from './product-picker'
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
  /** Avvisa quando ci sono dati inseriti e non ancora inviati (per chiedere conferma prima di uscire). */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Cliente (privato o azienda), prodotti, consegna e note di un nuovo ordine o prenotazione.
 * Bastano il nome o il cognome del cliente e un prodotto: il resto è facoltativo e sta in
 * "Altri dati". A destra il riepilogo con il totale resta in vista mentre si scelgono i prodotti.
 */
export function BookingForm({ catalog, showAgent = false, submitting, submitLabel, onSubmit, onDirtyChange }: BookingFormProps) {
  const [kind, setKind] = useState<'privato' | 'azienda'>('privato')
  const [customer, setCustomer] = useState<Customer>(EMPTY)
  const [moreData, setMoreData] = useState(false)
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
  const named = Boolean(customer.first_name.trim() || customer.last_name.trim())
  const missing = [!named && 'il nome o il cognome del cliente', lines.length === 0 && 'almeno un prodotto'].filter(Boolean)
  const ready = missing.length === 0
  const byAgent = catalog.delivery_options.some((option) => option.id === deliveryId && option.agent)
  const dirty =
    kind !== 'privato' ||
    Object.values(customer).some((value) => value.trim() !== '') ||
    lines.length > 0 ||
    deliveryId !== NONE ||
    agentId !== NONE ||
    notes.trim() !== ''
  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange])

  // Con la consegna a cura dell'agente serve l'indirizzo del cliente: si aprono gli altri dati.
  const chooseDelivery = (id: string) => {
    setDeliveryId(id)
    if (catalog.delivery_options.some((option) => option.id === id && option.agent)) setMoreData(true)
  }

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
    <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4" aria-labelledby="booking-customer">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Heading level="h2" id="booking-customer">
              Cliente
            </Heading>
            <RadioGroup value={kind} onValueChange={(value) => setKind(value as 'privato' | 'azienda')} className="flex gap-5">
              <div className="flex items-center gap-2">
                <RadioGroup.Item value="privato" id="booking-kind-privato" />
                <Label htmlFor="booking-kind-privato" size="small">
                  Privato
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroup.Item value="azienda" id="booking-kind-azienda" />
                <Label htmlFor="booking-kind-azienda" size="small">
                  Azienda
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {business && input('company', 'Ragione sociale', 'Negozio, ristorante, bottega.')}
            {business && input('vat_number', 'Partita IVA', '11 cifre.')}
            {input('first_name', business ? 'Nome del referente' : 'Nome')}
            {input('last_name', business ? 'Cognome del referente' : 'Cognome')}
            {input('phone', 'Telefono')}
          </div>
          <button
            type="button"
            className="flex w-fit items-center gap-1 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            aria-expanded={moreData}
            aria-controls="booking-more"
            onClick={() => setMoreData((open) => !open)}
          >
            <span className="txt-compact-small-plus">Altri dati del cliente</span>
            <ChevronDownMini className={clx('transition-transform', moreData && 'rotate-180')} />
          </button>
          {moreData && (
            <div id="booking-more" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {input('email', 'Email', 'Se c’è, il cliente riceve la conferma.')}
              {input('fiscal_code', 'Codice fiscale')}
              <div className="md:col-span-2">{input('address_1', 'Indirizzo')}</div>
              {input('city', 'Comune')}
              <div className="grid grid-cols-2 gap-4">
                {input('postal_code', 'CAP')}
                {input('province', 'Provincia', 'Sigla, es. TE.')}
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="booking-products">
          <Heading level="h2" id="booking-products">
            Prodotti
          </Heading>
          <ProductPicker
            variants={catalog.variants}
            quantities={quantities}
            onChange={(variantId, quantity) => setQuantities((current) => ({ ...current, [variantId]: quantity }))}
          />
        </section>
      </div>

      <aside className="flex flex-col gap-5 self-start rounded-lg border border-ui-border-base bg-ui-bg-subtle p-5 lg:sticky lg:top-0" aria-labelledby="booking-summary">
        <Heading level="h3" id="booking-summary">
          Riepilogo
        </Heading>
        {lines.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">
            Nessun prodotto scelto.
          </Text>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map(({ variant, quantity }) => (
              <li key={variant.variantId} className="flex justify-between gap-3">
                <Text size="small" className="text-ui-fg-subtle">
                  <span className="lq-figure">{quantity}</span> × {variant.product}, {variant.variant}
                </Text>
                <Text size="small" className="lq-figure shrink-0">
                  {formatEuro((variant.price ?? 0) * quantity)}
                </Text>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-baseline justify-between border-t border-ui-border-base pt-4">
          <Text size="small" className="text-ui-fg-subtle">
            Totale, IVA inclusa
          </Text>
          <span className="lq-figure text-xl font-medium text-ui-fg-base">{formatEuro(estimate)}</span>
        </div>

        <FormField
          id="booking-delivery"
          label="Consegna"
          hint={byAgent ? 'L’indirizzo del cliente va in «Altri dati del cliente».' : undefined}
        >
          <Select value={deliveryId} onValueChange={chooseDelivery}>
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
          <FormField id="booking-agent" label="Agente" hint="La vendita entra nei suoi riepiloghi.">
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
        <FormField id="booking-notes" label="Note">
          <Textarea id="booking-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormField>

        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" isLoading={submitting} disabled={!ready}>
            {submitLabel}
          </Button>
          <Text size="xsmall" className="text-ui-fg-muted" aria-live="polite">
            {ready ? 'Il resto dei dati si può aggiungere dopo.' : `Manca ${missing.join(' e ')}.`}
          </Text>
        </div>
      </aside>
    </form>
  )
}
