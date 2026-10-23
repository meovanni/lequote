import { Button, Heading, Input, Select, StatusBadge, Text, Textarea } from '@medusajs/ui'
import { useEffect, useState } from 'react'
import { FormField } from '../form-field'
import { PaymentForm, PaymentsSummary } from './payments'
import { maxFor, stockLabel } from './stock-label'
import { formatDay, formatEuro, useSalesAction, useSellBooking, type Catalog } from '../../lib/sales-api'

/** Una prenotazione dell'agente (nel pannello dello storico): quantità e note modificabili, incassi registrabili. */
type BookingEditorProps = {
  bookingId: string
  catalog: Catalog
  /** Avvisa quando ci sono modifiche o un incasso non ancora salvati. */
  onDirtyChange?: (dirty: boolean) => void
}

export function BookingEditor({ bookingId, catalog, onDirtyChange }: BookingEditorProps) {
  const detail = useSellBooking(bookingId)
  const action = useSalesAction()
  const [quantities, setQuantities] = useState<Record<string, string> | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  // Tendina senza valore: mostra il segnaposto e torna vuota dopo ogni aggiunta.
  const [toAdd, setToAdd] = useState<string | undefined>(undefined)
  const [paymentDirty, setPaymentDirty] = useState(false)
  const dirty = quantities !== null || notes !== null || paymentDirty
  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange])

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
  // Pezzi che la prenotazione tiene già: restano suoi, il massimo è disponibile + già tenuto.
  const held = (variantId: string) => booking.lines.filter((line) => line.variantId === variantId).reduce((sum, line) => sum + line.quantity, 0)
  const variantOf = (variantId: string) => catalog.variants.find((item) => item.variantId === variantId)
  const maxOf = (variantId: string) => {
    const variant = variantOf(variantId)
    return variant ? maxFor(variant, held(variantId)) : null
  }
  const overLimit = (variantId: string) => {
    const max = maxOf(variantId)
    return max !== null && Number(current[variantId] || 0) > max
  }
  const anyOver = Object.keys(current).some(overLimit)
  const addable = catalog.variants.filter(
    (variant) => variant.price !== null && !(variant.variantId in current) && (variant.available === null || variant.available > 0),
  )

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
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Heading level="h2">{booking.customer}</Heading>
          {booking.status === 'canceled' && <StatusBadge color="grey">Annullata</StatusBadge>}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {formatDay(booking.createdAt)}, {booking.delivery}
        </Text>
        {booking.phone && (
          <Text size="small" className="text-ui-fg-subtle">
            Telefono <a href={`tel:${booking.phone}`} className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">{booking.phone}</a>
          </Text>
        )}
      </div>

      <section className="flex flex-col gap-2">
        {Object.keys(current).map((variantId) => {
          const variant = variantOf(variantId)
          const max = maxOf(variantId)
          return (
            <div key={variantId} className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div>
                <Text size="small">{label(variantId)}</Text>
                {open && variant && stockLabel(variant, held(variantId)) && (
                  <Text size="xsmall" className={overLimit(variantId) ? 'text-ui-fg-error' : 'text-ui-fg-subtle'}>
                    {overLimit(variantId) ? `Disponibili solo ${max}.` : max !== null && max > 0 ? `Fino a ${max}` : 'Esaurito'}
                  </Text>
                )}
              </div>
              <Input
                aria-label={`Quantità di ${label(variantId)}`}
                aria-invalid={overLimit(variantId)}
                type="number"
                min={0}
                max={max ?? undefined}
                className="w-24"
                disabled={!open}
                value={current[variantId]}
                onChange={(event) => setQuantities({ ...current, [variantId]: event.target.value })}
              />
            </div>
          )
        })}
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
                  {variant.product}, {variant.variant} ({formatEuro(variant.price ?? 0)}{stockLabel(variant) ? `, ${stockLabel(variant)}` : ''})
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
            <Button size="small" variant="secondary" isLoading={action.isPending} disabled={(quantities === null && notes === null) || anyOver} onClick={save}>
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
            onDirtyChange={setPaymentDirty}
            submitting={action.isPending}
            onSubmit={(body) => action.mutate({ path: `/admin/sell/bookings/${booking.id}/payments`, body, success: 'Incasso registrato.' })}
          />
        )}
      </section>
    </div>
  )
}
