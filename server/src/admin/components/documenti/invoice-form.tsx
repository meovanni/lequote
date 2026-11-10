import { Button, Checkbox, Heading, Input, Label, Text } from '@medusajs/ui'
import { useMemo, useState } from 'react'
import { FormField } from '../form-field'
import { useInvoiceCandidates, type InvoiceCandidate, type Party } from '../../lib/documenti-api'
import { formatDay, formatEuro, useSalesAction } from '../../lib/sales-api'
import { PartyFields } from './party-fields'

// Nuova fattura: si sceglie il cliente, poi i suoi ordini da fatturare (di norma quelli con DDT
// del mese: fattura differita), si completano i dati fiscali e si emette.

function CustomerInvoice({ candidate, nextNumber, onDone }: { candidate: InvoiceCandidate; nextNumber: number; onDone: () => void }) {
  const action = useSalesAction()
  const [selected, setSelected] = useState<Set<string>>(() => new Set(candidate.orders.filter((order) => order.ddt || order.delivered).map((order) => order.id)))
  const [customer, setCustomer] = useState<Party>(candidate.customer)
  const [number, setNumber] = useState(String(nextNumber))
  const [paymentTerms, setPaymentTerms] = useState('')
  const [notes, setNotes] = useState('')
  const total = candidate.orders.filter((order) => selected.has(order.id)).reduce((sum, order) => sum + order.total, 0)

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const chosen = Number(number)
    action.mutate(
      {
        path: '/admin/documenti/fatture',
        body: { order_ids: [...selected], customer, paymentTerms, notes, ...(chosen && chosen !== nextNumber ? { number: chosen } : {}) },
        success: 'Fattura emessa: la trovi nell’elenco qui sotto.',
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Text size="small" weight="plus">
          Ordini da fatturare
        </Text>
        {candidate.orders.map((order) => (
          <div key={order.id} className="flex items-center gap-2">
            <Checkbox id={`invoice-${order.id}`} checked={selected.has(order.id)} onCheckedChange={() => toggle(order.id)} />
            <Label htmlFor={`invoice-${order.id}`} size="small" className="flex flex-wrap gap-x-2">
              <span>
                n. {order.code} del {formatDay(order.createdAt)}
              </span>
              <span className="lq-figure">{formatEuro(order.total)}</span>
              <span className="text-ui-fg-subtle">{order.ddt ?? (order.delivered ? 'consegnato, senza DDT' : 'non ancora consegnato')}</span>
            </Label>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Text size="small" weight="plus">
          Cliente
        </Text>
        <PartyFields id="invoice-customer" party={customer} onChange={setCustomer} invoice />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FormField id="invoice-number" label="Numero" hint={`Il prossimo è ${nextNumber}.`}>
          <Input id="invoice-number" size="small" inputMode="numeric" value={number} onChange={(event) => setNumber(event.target.value)} />
        </FormField>
        <div className="col-span-2 md:col-span-3">
          <FormField id="invoice-terms" label="Termini di pagamento" hint="Per esempio: bonifico a 30 giorni.">
            <Input id="invoice-terms" size="small" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} />
          </FormField>
        </div>
      </div>
      <FormField id="invoice-notes" label="Note">
        <Input id="invoice-notes" size="small" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </FormField>
      <div className="flex items-center justify-end gap-3">
        <Text size="small" className="lq-figure">
          Totale {formatEuro(total)}
        </Text>
        <Button size="small" type="submit" disabled={selected.size === 0} isLoading={action.isPending}>
          Emetti la fattura
        </Button>
      </div>
    </form>
  )
}

export function InvoiceForm({ nextNumber, onDone }: { nextNumber: number; onDone: () => void }) {
  const candidates = useInvoiceCandidates(true)
  const [key, setKey] = useState('')
  const [search, setSearch] = useState('')
  const customers = candidates.data?.customers ?? []
  const visible = useMemo(() => customers.filter((entry) => entry.customer.name.toLowerCase().includes(search.trim().toLowerCase())), [customers, search])
  const candidate = customers.find((entry) => entry.key === key)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading level="h2">Nuova fattura</Heading>
        <Button size="small" variant="transparent" onClick={onDone}>
          Chiudi
        </Button>
      </div>
      {!candidates.data ? (
        <div className="h-32 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento" />
      ) : candidate ? (
        <>
          <div className="flex items-center gap-2">
            <Text size="small" weight="plus">
              {candidate.customer.name || 'Cliente senza nome'}
            </Text>
            <Button size="small" variant="transparent" onClick={() => setKey('')}>
              Cambia cliente
            </Button>
          </div>
          <CustomerInvoice key={candidate.key} candidate={candidate} nextNumber={nextNumber} onDone={onDone} />
        </>
      ) : customers.length === 0 ? (
        <Text size="small" className="text-ui-fg-subtle">
          Nessun ordine da fatturare.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          <Input size="small" placeholder="Cerca il cliente" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Cerca il cliente" />
          <ul className="divide-y divide-ui-border-base rounded-lg border border-ui-border-base">
            {visible.map((entry) => (
              <li key={entry.key}>
                <button type="button" onClick={() => setKey(entry.key)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-ui-bg-base-hover">
                  <Text size="small" weight="plus">
                    {entry.customer.name || 'Cliente senza nome'}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {entry.orders.length === 1 ? '1 ordine' : `${entry.orders.length} ordini`} · {entry.orders.filter((order) => order.ddt).length} con DDT
                  </Text>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
