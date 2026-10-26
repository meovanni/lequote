import { defineRouteConfig } from '@medusajs/admin-sdk'
import { BuildingStorefront } from '@medusajs/icons'
import { Container, Heading, Text } from '@medusajs/ui'
import { OrdersPanel } from '../../components/gestione/orders-panel'
import { StockPanel } from '../../components/gestione/stock-panel'
import { useGestione } from '../../lib/gestione-api'

// La pagina di tutti i giorni: magazzino e ordini insieme, tutto modificabile sul posto. Si apre
// appena entrati nel back office; le schermate tecniche di Medusa restano in "Strumenti avanzati".
const GestionePage = () => {
  const gestione = useGestione()

  if (gestione.isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-label="Caricamento">
        <div className="h-64 animate-pulse rounded-lg bg-ui-bg-component" />
        <div className="h-96 animate-pulse rounded-lg bg-ui-bg-component" />
      </div>
    )
  }
  if (!gestione.data) {
    return (
      <Container className="px-6 py-10">
        <Heading level="h1">Gestione</Heading>
        <Text className="text-ui-fg-error">Non riesco a leggere magazzino e ordini. Ricarica la pagina.</Text>
      </Container>
    )
  }

  const { lines, formats, orders } = gestione.data
  return (
    <div className="flex flex-col gap-3">
      <StockPanel lines={lines} formats={formats} />
      <OrdersPanel orders={orders} formats={formats} lines={lines} />
    </div>
  )
}

export const config = defineRouteConfig({ label: 'Gestione', icon: BuildingStorefront, rank: 0 })

export default GestionePage
