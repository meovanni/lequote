import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Button, FocusModal, Heading, Text } from '@medusajs/ui'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookingForm } from '../components/sales/booking-form'
import { useBackofficeCatalog, useSalesAction } from '../lib/sales-api'

/**
 * "Nuovo ordine" (telefono, mercato, cliente di un agente) nella barra in alto dell'elenco ordini:
 * Medusa mette i widget della pagina sotto la tabella, qui il pulsante resta in vista. L'ordine
 * nasce con "inserito da" = l'utente e gli incassi si registrano nella scheda.
 */
const NewOrderWidget = () => {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const catalog = useBackofficeCatalog(open)
  const action = useSalesAction()

  if (pathname !== '/orders') return null

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
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small">Nuovo ordine</Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header />
        <FocusModal.Body className="flex justify-center overflow-y-auto px-6 py-8">
          <div className="flex w-full max-w-5xl flex-col gap-6">
            <div>
              <Heading level="h1">Nuovo ordine</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Ordini presi a voce, al mercato o per conto di un agente.
              </Text>
            </div>
            {catalog.isLoading && <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" aria-label="Caricamento del catalogo" />}
            {catalog.isError && <Text className="text-ui-fg-error">Catalogo non disponibile.</Text>}
            {catalog.data && <BookingForm catalog={catalog.data} showAgent submitting={action.isPending} submitLabel="Inserisci ordine" onSubmit={submit} />}
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

export const config = defineWidgetConfig({ zone: 'topbar' })

export default NewOrderWidget
