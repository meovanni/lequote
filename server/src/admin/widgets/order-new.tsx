import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Button, FocusModal, Heading, Text } from '@medusajs/ui'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookingForm } from '../components/sales/booking-form'
import { OrderImportModal } from '../components/sales/order-import-modal'
import { useGuardedOpen } from '../components/use-guarded-open'
import { useBackofficeCatalog, useSalesAction } from '../lib/sales-api'

/**
 * "Importa da Excel" e "Nuovo ordine" (telefono, mercato, cliente di un agente) nella barra in alto
 * dell'elenco ordini: Medusa mette i widget della pagina sotto la tabella, qui i pulsanti restano
 * in vista. L'ordine nasce con "inserito da" = l'utente e gli incassi si registrano nella scheda.
 */
const NewOrderWidget = () => {
  const { pathname } = useLocation()
  const [dirty, setDirty] = useState(false)
  const { open, onOpenChange, close, contentProps } = useGuardedOpen({ dirty, onDiscard: () => setDirty(false) })
  const navigate = useNavigate()
  const catalog = useBackofficeCatalog(open)
  const action = useSalesAction()

  if (pathname !== '/orders') return null

  const submit = (body: Record<string, unknown>) =>
    action.mutate(
      { path: '/admin/backoffice/orders', body, success: 'Ordine inserito.' },
      {
        onSuccess: (data) => {
          close()
          navigate(`/orders/${data.order_id as string}`)
        },
      },
    )

  return (
    <div className="flex items-center gap-2">
      <OrderImportModal />
      <FocusModal open={open} onOpenChange={onOpenChange}>
        <FocusModal.Trigger asChild>
          <Button size="small">Nuovo ordine</Button>
        </FocusModal.Trigger>
        <FocusModal.Content {...contentProps}>
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
              {catalog.data && <BookingForm catalog={catalog.data} showAgent submitting={action.isPending} submitLabel="Inserisci ordine" onSubmit={submit} onDirtyChange={setDirty} />}
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}

export const config = defineWidgetConfig({ zone: 'topbar' })

export default NewOrderWidget
