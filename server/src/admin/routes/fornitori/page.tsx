import { defineRouteConfig } from '@medusajs/admin-sdk'
import { BuildingStorefront } from '@medusajs/icons'
import { Container, Heading, Tabs, Text } from '@medusajs/ui'
import { NewSupplierDrawer } from '../../components/filiera/new-supplier-drawer'
import { SupplierPanel, SupplierTypesPanel } from '../../components/filiera/supplier-panel'

const SuppliersPage = () => (
  <Container className="p-0">
    <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
      <div className="max-w-[65ch]">
        <Heading level="h1">Fornitori</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Frantoi, stabilimenti di confezionamento, laboratori, packaging e ogni altra tipologia. Un fornitore può averne più di una: il
          frantoio che imbottiglia è sia Frantoio sia Imbottigliamento.
        </Text>
      </div>
      <NewSupplierDrawer />
    </div>
    <Tabs defaultValue="suppliers">
      <Tabs.List className="px-6">
        <Tabs.Trigger value="suppliers">Fornitori</Tabs.Trigger>
        <Tabs.Trigger value="types">Tipologie</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="suppliers" className="data-[state=inactive]:hidden mt-3 border-t border-ui-border-base">
        <SupplierPanel />
      </Tabs.Content>
      <Tabs.Content value="types" className="data-[state=inactive]:hidden mt-3 border-t border-ui-border-base">
        <SupplierTypesPanel />
      </Tabs.Content>
    </Tabs>
  </Container>
)

export const config = defineRouteConfig({ label: 'Fornitori', icon: BuildingStorefront })

export default SuppliersPage
