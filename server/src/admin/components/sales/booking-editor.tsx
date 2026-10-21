import { Button, Heading, Input, Select, Text, Textarea } from '@medusajs/ui'
import { useState } from 'react'
import { FormField } from '../form-field'
import { PaymentForm, PaymentsSummary } from './payments'
import { formatDay, formatEuro, useSalesAction, useSellBooking, type Catalog } from '../../lib/sales-api'

/** Una prenotazione dell'agente: quantità e note modificabili, incassi registrabili. */
export function BookingEditor({ bookingId, catalog }: { bookingId: string; catalog: Catalog }) {
  const detail = useSellBooking(bookingId)
  const action = useSalesAction()
  const [quantities, setQuantities] = useState<Record<string, string> | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  // Tendina senza valore: mostra il segnaposto e torna vuota dopo ogni aggiunta.
  const [toAdd, setToAdd] = useState<string | undefined>(undefined)

  if (detail.isLoading) return <Text className="text-ui-fg-subtle">Caricamento…</Text>
  if (!detail.data) return <Text className="text-ui-fg-error">Prenotazione non trovata.</Text>
  const { booking, payments } = detail.data
  const open = booking.status !== 'canceled' && booking.status !== 'completed'

  const current: Record<string, string> =
    quantities ?? Object.fromEntries(booking.lines.filter((line) => line.variantId).map((line) => [line.variantId as string, String(line.quantity)]))
  const label = (variantId: string) => {
    const line = booking.lines.find((item) => item.variantId === variantId)
    if (line) return `${line.title}, ${line.subtitle}`
    const variant = catalog.variants.find((item) => item.variantId === variantId)
    return variant ? `${variant.product}, ${variant.variant}` : variantId
  }
  const addable = catalog.variants.filter((variant) => variant.price !== null && !(variant.variantId in current))

  const save = () =>
    action.mutate(
      {
        path: `/admin/sell/bookings/${booking.id}`,
        body: {
          items: Object.entries(current).map(([variant_id, quantity]) => ({ variant_id, quantity: Number(quantity || 0) })),
          ...(notes !== null ? { notes: notes.trim() || null } : {}),
        },
        success: 'Prenotazione aggiornata.',
      },
      {
        onSuccess: () => {
          setQuantities(null)
          setNotes(null)
        },
      },
    )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level="h2">
          Prenotazione n. {booking.displayId} · {booking.customer}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {formatDay(booking.createdAt)} · {booking.delivery}
          {booking.phone ? ` · ${booking.phone}` : ''}
          {booking.status === 'canceled' ? ' · Annullata' : ''}
        </Text>
      </div>

      <section className="flex flex-col gap-2">
        {Object.keys(current).map((variantId) => (
          <div key={variantId} className="grid grid-cols-[1fr_auto] items-center gap-4">
            <Text size="small">{label(variantId)}</Text>
            <Input
              aria-label={`Quantità di ${label(variantId)}`}
              type="number"
              min={0}
              className="w-24"
              disabled={!open}
              value={current[variantId]}
              onChange={(event) => setQuantities({ ...current, [variantId]: event.target.value })}
            />
          </div>
        ))}
        {open && addable.length > 0 && (
          <Select
            value={toAdd}
            onValueChange={(variantId) => {
              setQuantities({ ...current, [variantId]: '1' })
              setToAdd(undefined)
            }}
          >
            <Select.Trigger aria-label="Aggiungi un prodotto">
              <Select.Value placeholder="Aggiungi un prodotto" />
            </Select.Trigger>
            <Select.Content>
              {addable.map((variant) => (
                <Select.Item key={variant.variantId} value={variant.variantId}>
                  {variant.product}, {variant.variant} ({formatEuro(variant.price ?? 0)})
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        <FormField id="booking-edit-notes" label="Note">
          <Textarea id="booking-edit-notes" disabled={!open} value={notes ?? booking.notes ?? ''} onChange={(event) => setNotes(event.target.value)} />
        </FormField>
        {open && (
          <div className="flex justify-end">
            <Button size="small" variant="secondary" isLoading={action.isPending} disabled={quantities === null && notes === null} onClick={save}>
              Salva modifiche
            </Button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <Heading level="h3">Incassi</Heading>
        <PaymentsSummary state={payments} />
        {open && (
          <PaymentForm
            due={payments.due}
            submitting={action.isPending}
            onSubmit={(body) => action.mutate({ path: `/admin/sell/bookings/${booking.id}/payments`, body, success: 'Incasso registrato.' })}
          />
        )}
      </section>
    </div>
  )
}
