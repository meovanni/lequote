import { Button, clx, Input, Select, Table, Text } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { formatDay, formatEuro, PAYMENT_METHOD_LABEL, type PaymentMethod, type PaymentState } from '../../lib/sales-api'

const today = () => new Date().toISOString().slice(0, 10)

/** Totale, incassato e residuo, con gli incassi registrati. */
export function PaymentsSummary({ state }: { state: PaymentState }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <Figure label="Totale" value={formatEuro(state.total)} />
        <Figure label="Incassato" value={formatEuro(state.paid)} />
        <Figure label="Da incassare" value={formatEuro(state.due)} strong={state.due > 0} />
      </div>
      {state.payments.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Data</Table.HeaderCell>
              <Table.HeaderCell>Mezzo</Table.HeaderCell>
              <Table.HeaderCell>Importo</Table.HeaderCell>
              <Table.HeaderCell>Registrato da</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {state.payments.map((payment) => (
              <Table.Row key={payment.id}>
                <Table.Cell>{formatDay(payment.paid_at)}</Table.Cell>
                <Table.Cell>{PAYMENT_METHOD_LABEL[payment.method]}</Table.Cell>
                <Table.Cell>{formatEuro(Number(payment.amount))}</Table.Cell>
                <Table.Cell>{payment.recorded_by_name}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  )
}

/** Un importo del riepilogo; il residuo da incassare prende il colore dell'ottone. */
function Figure({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-ui-bg-component px-3 py-2">
      <Text size="xsmall" className="text-ui-fg-subtle">
        {label}
      </Text>
      <span className={clx('lq-figure text-base font-medium', strong ? 'text-ui-tag-orange-text' : 'text-ui-fg-base')}>{value}</span>
    </div>
  )
}

/** Nuovo incasso: acconto o saldo, con il residuo proposto come importo. */
export function PaymentForm({ due, submitting, onSubmit }: { due: number; submitting: boolean; onSubmit: (body: Record<string, unknown>) => void }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('contanti')
  const [day, setDay] = useState(today())
  const [notes, setNotes] = useState('')

  if (due <= 0) {
    return (
      <Text size="small" className="text-ui-fg-subtle">
        Ordine saldato.
      </Text>
    )
  }

  const value = Number(amount.replace(',', '.'))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ amount: value, method, paid_at: day, notes: orNull(notes) })
    setAmount('')
    setNotes('')
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <FormField id="payment-amount" label="Importo (€)" hint={`Residuo: ${formatEuro(due)}`}>
        <Input id="payment-amount" inputMode="decimal" value={amount} placeholder={due.toFixed(2)} onChange={(event) => setAmount(event.target.value)} />
      </FormField>
      <FormField id="payment-method" label="Mezzo">
        <Select value={method} onValueChange={(next) => setMethod(next as PaymentMethod)}>
          <Select.Trigger id="payment-method">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {Object.entries(PAYMENT_METHOD_LABEL).map(([key, label]) => (
              <Select.Item key={key} value={key}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </FormField>
      <FormField id="payment-day" label="Data">
        <Input id="payment-day" type="date" value={day} onChange={(event) => setDay(event.target.value)} />
      </FormField>
      <FormField id="payment-notes" label="Note">
        <Input id="payment-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </FormField>
      <div className="flex justify-end gap-2 md:col-span-2">
        <Button type="button" variant="secondary" size="small" onClick={() => setAmount(due.toFixed(2))}>
          Salda tutto
        </Button>
        <Button type="submit" size="small" isLoading={submitting} disabled={!(value > 0) || value > due + 0.001}>
          Registra incasso
        </Button>
      </div>
    </form>
  )
}
