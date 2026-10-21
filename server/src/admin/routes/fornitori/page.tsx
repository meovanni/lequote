import { defineRouteConfig } from '@medusajs/admin-sdk'
import { BuildingStorefront } from '@medusajs/icons'
import { Container, Heading, Tabs, Text } from '@medusajs/ui'
import { SupplierPanel, SupplierTypesPanel } from '../../components/filiera/supplier-panel'

const SuppliersPage = () => (
  <Container className="p-0">
    <div className="px-6 py-4">
      <Heading level="h1">Fornitori</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Frantoi, stabilimenti di confezionamento, laboratori, packaging e ogni altra tipologia. Un fornitore può averne
        più di una: il frantoio che imbottiglia è sia Frantoio sia Imbottigliamento.
      </Text>
    </div>
    <Tabs defaultValue="suppliers">
      <Tabs.List className="px-6">
        <Tabs.Trigger value="suppliers">Fornitori</Tabs.Trigger>
        <Tabs.Trigger value="types">Tipologie</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="suppliers" className="mt-2 border-t">
        <SupplierPanel />
      </Tabs.Content>
      <Tabs.Content value="types" className="mt-2 border-t">
        <SupplierTypesPanel />
      </Tabs.Content>
    </Tabs>
  </Container>
)

export const config = defineRouteConfig({ label: 'Fornitori', icon: BuildingStorefront })

export default SuppliersPage
