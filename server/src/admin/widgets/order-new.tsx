import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Button, FocusModal, Heading, Text } from '@medusajs/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookingForm } from '../components/sales/booking-form'
import { useBackofficeCatalog, useSalesAction } from '../lib/sales-api'

/**
 * Sopra l'elenco ordini: inserimento di un ordine dal back office (telefono, mercato, cliente di un
 * agente). L'ordine nasce con "inserito da" = l'utente e gli incassi si registrano nella scheda.
 */
const NewOrderWidget = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const catalog = useBackofficeCatalog(open)
  const action = useSalesAction()

  const submit = (body: Record<string, unknown>) =>
    action.mutate(
      { path: '/admin/backoffice/orders', body, success: 'Ordine inserito.' },
      {
        onSuccess: (data) => {
          setOpen(false)
          navigate(`/orders/${data.order_id as string}`)
        },
      },
    )

  return (
    <div className="flex items-center justify-between rounded-lg border border-ui-border-base bg-ui-bg-base px-6 py-4">
      <Text size="small" className="text-ui-fg-subtle">
        Ordini presi a voce, al mercato o per conto di un agente.
      </Text>
      <FocusModal open={open} onOpenChange={setOpen}>
        <FocusModal.Trigger asChild>
          <Button size="small">Nuovo ordine</Button>
        </FocusModal.Trigger>
        <FocusModal.Content>
          <FocusModal.Header />
          <FocusModal.Body className="flex justify-center overflow-y-auto px-6 py-8">
            <div className="flex w-full max-w-3xl flex-col gap-6">
              <Heading level="h1">Nuovo ordine</Heading>
              {catalog.isLoading && <Text className="text-ui-fg-subtle">Caricamento…</Text>}
              {catalog.isError && <Text className="text-ui-fg-error">Catalogo non disponibile.</Text>}
              {catalog.data && <BookingForm catalog={catalog.data} showAgent submitting={action.isPending} submitLabel="Inserisci ordine" onSubmit={submit} />}
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}

export const config = defineWidgetConfig({ zone: 'order.list.before' })

export default NewOrderWidget
