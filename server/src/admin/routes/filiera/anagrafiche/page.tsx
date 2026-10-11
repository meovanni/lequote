import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Badge, Container, Heading, Table, Tabs, Text } from '@medusajs/ui'
import { RegistryPanel } from '../../../components/filiera/registry-panel'
import { LINE_LABEL, useStageTemplates, type RegistryKind } from '../../../lib/filiera-api'

const TABS: { kind: RegistryKind; label: string }[] = [
  { kind: 'groves', label: 'Oliveti' },
  { kind: 'apiaries', label: 'Apiari' },
  { kind: 'mills', label: 'Frantoi' },
  { kind: 'establishments', label: 'Stabilimenti' },
]

// Sola lettura per ora: i modelli si modificano via API; l'editor arriva quando i titolari
// avranno deciso quali dati raccogliere per ogni fase.
function StageTemplatesTab() {
  const { data } = useStageTemplates()
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Linea</Table.HeaderCell>
          <Table.HeaderCell>Fase</Table.HeaderCell>
          <Table.HeaderCell>Campi</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {(data?.templates ?? []).map((template) => (
          <Table.Row key={template.id}>
            <Table.Cell>{LINE_LABEL[template.product_line]}</Table.Cell>
            <Table.Cell>
              {template.position}. {template.name}
            </Table.Cell>
            <Table.Cell>
              <div className="flex flex-wrap gap-1">
                {template.fields.length === 0 && <Text size="small" className="text-ui-fg-subtle">Solo data e luogo</Text>}
                {template.fields.map((field) => (
                  <Badge key={field.key} size="2xsmall">
                    {field.label}
                  </Badge>
                ))}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const RegistriesPage = () => (
  <Container className="p-0">
    <div className="px-6 py-4">
      <Heading level="h1">Anagrafiche</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Oliveti, apiari, frantoi e stabilimenti si inseriscono una volta e si riusano in ogni campagna.
      </Text>
    </div>
    <Tabs defaultValue="groves">
      <Tabs.List className="px-6">
        {TABS.map((tab) => (
          <Tabs.Trigger key={tab.kind} value={tab.kind}>
            {tab.label}
          </Tabs.Trigger>
        ))}
        <Tabs.Trigger value="templates">Modelli di fase</Tabs.Trigger>
      </Tabs.List>
      {TABS.map((tab) => (
        <Tabs.Content key={tab.kind} value={tab.kind} className="mt-2 border-t">
          <RegistryPanel kind={tab.kind} />
        </Tabs.Content>
      ))}
      <Tabs.Content value="templates" className="mt-2 border-t">
        <StageTemplatesTab />
      </Tabs.Content>
    </Tabs>
  </Container>
)

export const config = defineRouteConfig({ label: 'Anagrafiche' })

export default RegistriesPage
